"use client";

/**
 * Laboratorio 3D — Densidad y Flotación.
 * Práctica experimental para "Cálculo de densidad" (CNEYT-I-P02-A6).
 *
 * El estudiante elige un líquido y un material (o entra en modo personalizado
 * con masa y volumen) y observa en 3D si el objeto flota o se hunde según
 * ρ = m / V comparada con la densidad del líquido (principio de Arquímedes).
 *
 * Diseño: tema oscuro "instrumento de laboratorio" que se funde con el shell
 * PracticaRunner (navy). La física se hace VISIBLE con:
 *   · Cara a cara de densidades (ρ objeto vs ρ líquido en la misma escala).
 *   · Balanza de fuerzas Peso ↔ Empuje con aguja.
 *   · Indicador EN VIVO + veredicto animado.
 * Si el dispositivo no soporta WebGL, un fallback 2D sigue demostrando la
 * física (sin 3D) en lugar de crashear.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, NUM, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { LabSfx } from "./lab-audio";
import { FichaTeorica } from "./_ficha";
import { DENSIDAD_FICHA } from "./densidad-ficha";
import { EJERCICIO_A6 } from "./densidad-data";

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
        color: "rgba(255,255,255,0.55)",
      }}
    >
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const G = 9.81; // m/s²

// Colores de estado (calibrados para fondo oscuro)
const C_FLOTA = "#34D399";
const C_HUNDE = "#F87171";
const C_EQUI = "#FBBF24";
const C_PESO = "#F87171"; // = flecha de Peso en la escena 3D
const C_EMPUJE = "#38BDF8"; // = flecha de Empuje en la escena 3D

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
    className="dx-tile"
    data-on={active}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "10px 12px",
      textAlign: "left",
      cursor: "pointer",
      borderRadius: 13,
      border: active ? `1.5px solid ${accent}` : `1px solid ${T.line}`,
      background: active ? `rgba(${colorRgba},0.14)` : T.glass,
      boxShadow: active ? `0 0 18px -4px rgba(${colorRgba},0.5)` : "none",
      transition: "all 0.16s ease",
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
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.45)",
      }}
    />
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{label}</span>
      <span style={{ display: "block", fontSize: 11.5, color: T.text3, ...NUM }}>{sub}</span>
    </span>
    {active && <i className="fa-solid fa-check" style={{ fontSize: 12, color: accent }} />}
  </button>
);

/* ── Cara a cara de densidades: el "porqué" del resultado ─────────────── */
const DensityBar = ({ label, value, unit, width, color }: { label: string; value: number; unit: string; width: number; color: string }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text, ...NUM }}>
        {fmt(value)} <span style={{ color: T.text3, fontWeight: 600 }}>{unit}</span>
      </span>
    </div>
    <div style={{ height: 14, borderRadius: 999, background: T.inset, overflow: "hidden", border: `1px solid ${T.line}` }}>
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
          boxShadow: `0 0 14px -2px ${color}`,
          transition: "width 0.5s cubic-bezier(0.34,1.2,0.64,1)",
        }}
      />
    </div>
  </div>
);

const DensityFaceoff = ({
  objDensity,
  liquidDensity,
  liquidColor,
  objColor,
  veredictoCol,
}: {
  objDensity: number;
  liquidDensity: number;
  liquidColor: string;
  objColor: string;
  veredictoCol: string;
}) => {
  const max = Math.max(objDensity, liquidDensity) * 1.12 || 1;
  const objW = Math.max((objDensity / max) * 100, 2);
  const liqW = Math.max((liquidDensity / max) * 100, 2);
  const op = objDensity < liquidDensity - 0.001 ? "<" : objDensity > liquidDensity + 0.001 ? ">" : "=";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Eyebrow>Comparación de densidades</Eyebrow>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: veredictoCol,
            padding: "3px 12px",
            borderRadius: 999,
            background: `${veredictoCol}1f`,
            border: `1px solid ${veredictoCol}44`,
            ...NUM,
          }}
        >
          ρ&nbsp;objeto&nbsp;<span style={{ fontSize: 15 }}>{op}</span>&nbsp;ρ&nbsp;líquido
        </span>
      </div>
      <DensityBar label="Densidad del objeto" value={objDensity} unit="g/cm³" width={objW} color={objColor} />
      <DensityBar label="Densidad del líquido" value={liquidDensity} unit="g/mL" width={liqW} color={liquidColor} />
    </div>
  );
};

/* ── Balanza de fuerzas Peso ↔ Empuje ────────────────────────────────── */
const ForceBalance = ({ weightN, buoyancyN, netN, veredictoCol }: { weightN: number; buoyancyN: number; netN: number; veredictoCol: string }) => {
  const max = Math.max(weightN, buoyancyN, 0.0001);
  // posición de la aguja: -1 (empuje gana, sube) … +1 (peso gana, baja)
  const tilt = Math.max(-1, Math.min(1, (weightN - buoyancyN) / max));
  const needleLeft = 50 + tilt * 46; // %

  return (
    <div>
      <Eyebrow>Balanza de fuerzas</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11.5, fontWeight: 700 }}>
        <span style={{ color: C_EMPUJE }}>
          <i className="fa-solid fa-arrow-up" style={{ marginRight: 5 }} />Empuje sube
        </span>
        <span style={{ color: C_PESO }}>
          Peso baja<i className="fa-solid fa-arrow-down" style={{ marginLeft: 5 }} />
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 12,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${C_EMPUJE}55 0%, ${T.inset} 50%, ${C_PESO}55 100%)`,
          border: `1px solid ${T.line}`,
        }}
      >
        {/* centro = equilibrio */}
        <div style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1.5, background: "rgba(255,255,255,0.22)", transform: "translateX(-50%)" }} />
        {/* aguja */}
        <div
          style={{
            position: "absolute",
            left: `${needleLeft}%`,
            top: "50%",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: veredictoCol,
            border: "2px solid rgba(255,255,255,0.85)",
            boxShadow: `0 0 16px -1px ${veredictoCol}`,
            transform: "translate(-50%,-50%)",
            transition: "left 0.5s cubic-bezier(0.34,1.2,0.64,1), background 0.3s ease",
          }}
        />
      </div>
      <div style={{ marginTop: 16, display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
        <Readout label="Peso (P)" value={fmt(weightN)} unit="N" col={C_PESO} />
        <div style={{ width: 1, background: T.line }} />
        <Readout label="Empuje (E)" value={fmt(buoyancyN)} unit="N" col={C_EMPUJE} />
        <div style={{ width: 1, background: T.line }} />
        <Readout
          label="Fuerza neta"
          value={`${netN > 0.005 ? "↓" : netN < -0.005 ? "↑" : "="} ${fmt(Math.abs(netN))}`}
          unit="N"
          col={veredictoCol}
        />
      </div>
    </div>
  );
};

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
  // sonido + teoría + interactividad ampliada
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false); // cajón de teoría
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  useEffect(() => () => audioRef.current?.dispose(), []);

  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      audioRef.current.burbujas(true); // ambiente acuático del tanque
      setSonido(true);
    } else {
      audioRef.current?.burbujas(false);
      audioRef.current?.mute();
      setSonido(false);
    }
  };

  // Soltar el objeto de nuevo (con salpicadura sonora si el sonido está activo)
  const soltar = () => {
    setDropNonce((n) => n + 1);
    if (sonido) audioRef.current?.gota();
  };

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
    if (neutral) return { txt: "Equilibrio", sub: "Densidades casi iguales: queda suspendido", icon: "fa-arrows-up-down", col: C_EQUI };
    if (ratio < 1) return { txt: "Flota", sub: `Se sumerge sólo el ${sumergido}%`, icon: "fa-arrow-up", col: C_FLOTA };
    return { txt: "Se hunde", sub: "Más denso que el líquido", icon: "fa-arrow-down", col: C_HUNDE };
  }, [neutral, ratio, sumergido]);

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  const objetivos = [
    { txt: "Haz que un objeto flote", done: ratio < 1 && !neutral },
    { txt: "Haz que un objeto se hunda", done: ratio > 1 },
    { txt: "Logra el equilibrio (ρ ≈ ρ líquido)", done: neutral },
    { txt: "Haz flotar un metal cambiando el líquido", done: !isCustom && (material?.metal ?? 0) > 0.5 && ratio < 1 },
    { txt: "Resuelve el ejercicio de cálculo de densidad", done: ejercicioAprobado },
  ];

  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 };

  // Fallback 2D cuando no hay WebGL: sigue mostrando la física
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          color: "#fff",
          background: veredicto.col,
          boxShadow: `0 10px 30px -6px ${veredicto.col}`,
        }}
      >
        <i className={`fa-solid ${veredicto.icon}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{veredicto.txt}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 320, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue funcionando: revisa la comparación de densidades y la
        balanza de fuerzas más abajo. <strong style={{ color: T.text }}>{sumergido}% sumergido.</strong>
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes dxPulse { 0%,100%{ box-shadow:0 0 0 0 var(--dxc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .dx-live-dot { animation: dxPulse 1.6s ease-in-out infinite; }
        .dx-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px;
          background:${T.lineStrong}; outline:none; }
        .dx-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px;
          border-radius:50%; background:#fff; cursor:pointer; border:2px solid ${accent};
          box-shadow:0 1px 8px rgba(0,0,0,0.5); }
        .dx-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; cursor:pointer;
          border:2px solid ${accent}; box-shadow:0 1px 8px rgba(0,0,0,0.5); }
        .dx-tile:hover { border-color:${T.lineStrong} !important; background:${T.glassSoft} !important; }
        .dx-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .dx-grid { grid-template-columns: 1fr; } }
        .dx-seg { display:flex; gap:4px; padding:4px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; }
        .dx-seg button { flex:1; cursor:pointer; border:none; background:transparent; border-radius:9px;
          padding:9px 10px; font-size:13.5px; font-weight:700; color:${T.text2}; display:flex; align-items:center;
          justify-content:center; gap:7px; transition:all .15s ease; }
        .dx-seg button[data-on="true"] { background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 14px -4px rgba(${color.rgba},0.6); }
        .dx-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .dx-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .dx-icobtn:hover { background:rgba(255,255,255,0.12); }
        .dx-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (max-width: 1000px){ .dx-bottom { grid-template-columns: 1fr !important; } }
        .dx-play { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 20px;
          border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:14.5px; font-weight:800; transition:all .15s; }
        .dx-play:hover { filter:brightness(1.08); }
        .dx-play:disabled { opacity:0.55; cursor:default; }
        .dx-cls { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 22px;
          border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .dx-drawer { position:absolute; top:0; right:0; height:100%; width:min(540px, 94%); transform:translateX(102%);
          transition:transform .34s cubic-bezier(.22,.61,.36,1); z-index:30; display:flex; flex-direction:column;
          background:linear-gradient(180deg, rgba(6,18,38,0.97), rgba(3,12,26,0.98)); border-left:1px solid rgba(${color.rgba},0.3);
          box-shadow:-20px 0 60px -20px rgba(0,0,0,0.6); }
        .dx-drawer[data-open="true"] { transform:translateX(0); }
        .dx-scrim { position:absolute; inset:0; background:rgba(2,8,18,0.5); backdrop-filter:blur(2px); z-index:20; opacity:0;
          pointer-events:none; transition:opacity .3s; }
        .dx-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .dx-opt { cursor:pointer; display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:700;
          text-align:left; transition:all .14s; }
        .dx-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .dx-opt:disabled { cursor:default; }
        .dx-num { width:120px; background:${T.inset}; border:1.5px solid ${T.line}; border-radius:10px; color:${T.text};
          font-size:16px; font-weight:800; padding:10px 12px; outline:none; text-align:right; }
        .dx-num:focus { border-color:${accent}; }
      `}</style>

      <div className="dx-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Escena 3D */}
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
            </SceneBoundary>

            {/* Cinta EN VIVO + veredicto */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px 8px 12px",
                borderRadius: 999,
                background: "rgba(2,12,28,0.74)",
                border: `1px solid ${veredicto.col}66`,
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                className="dx-live-dot"
                style={{ ["--dxc" as string]: `${veredicto.col}aa`, width: 9, height: 9, borderRadius: "50%", background: veredicto.col }}
              />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <i className={`fa-solid ${veredicto.icon}`} style={{ fontSize: 12, color: veredicto.col }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.text }}>{veredicto.txt}</span>
            </div>

            {/* Toolbar */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 2,
                padding: 4,
                borderRadius: 12,
                background: "rgba(2,12,28,0.74)",
                border: `1px solid ${T.line}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <button className="dx-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="dx-icobtn" data-on={showForces} onClick={() => setShowForces((v) => !v)} title="Vectores de fuerza">
                <i className="fa-solid fa-arrows-up-down" />
              </button>
              <button className="dx-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="dx-icobtn" onClick={soltar} title="Soltar de nuevo">
                <i className="fa-solid fa-rotate-left" />
              </button>
              <button className="dx-icobtn" data-on={drawer} onClick={() => setDrawer((v) => !v)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
            </div>

            {/* Botón Teoría destacado (cuando el cajón está cerrado) */}
            {!drawer && (
              <button
                onClick={() => setDrawer(true)}
                style={{ position: "absolute", top: 62, right: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 800, background: "rgba(2,12,28,0.74)", border: `1px solid rgba(${color.rgba},0.4)`, backdropFilter: "blur(10px)", zIndex: 5 }}
              >
                <i className="fa-solid fa-book-open" style={{ color: accent }} />
                Teoría
              </button>
            )}

            {/* ── CAJÓN DE TEORÍA ── */}
            <div className="dx-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
            <div className="dx-drawer" data-open={drawer}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${T.line}` }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 900, color: "#fff" }}>
                  <i className="fa-solid fa-book-open" style={{ color: accent }} /> Teoría de la práctica
                </span>
                <button className="dx-icobtn" onClick={() => setDrawer(false)} title="Cerrar">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
                <FichaTeorica data={DENSIDAD_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 16,
                fontSize: 11.5,
                color: T.text2,
                fontWeight: 600,
                pointerEvents: "none",
                background: "rgba(2,12,28,0.6)",
                padding: "4px 11px",
                borderRadius: 999,
                backdropFilter: "blur(6px)",
              }}
            >
              <i className="fa-solid fa-hand-pointer" style={{ marginRight: 6 }} />
              Arrastra para girar · rueda para acercar
            </div>
          </div>

          {/* Lectura del experimento: densidades + fuerzas */}
          <div style={{ ...card, padding: "20px 22px" }}>
            <DensityFaceoff
              objDensity={objDensity}
              liquidDensity={liquido.d}
              liquidColor={liquido.color}
              objColor={isCustom ? accent : objColor}
              veredictoCol={veredicto.col}
            />
            <div className="dx-divider" />
            <ForceBalance weightN={weightN} buoyancyN={buoyancyN} netN={netN} veredictoCol={veredicto.col} />
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
              background: T.inset,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: T.text2, fontSize: 17, fontWeight: 700 }}>ρ =</span>
            <div style={{ textAlign: "center", ...NUM }}>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{fmt(objMass, 0)} g</div>
              <div style={{ height: 2, background: T.text2, margin: "4px 0", borderRadius: 2 }} />
              <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{fmt(volume, 0)} cm³</div>
            </div>
            <span style={{ color: T.text2, fontSize: 17, fontWeight: 700 }}>=</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: accent, fontWeight: 900, fontSize: 30, ...NUM, letterSpacing: "-0.02em", textShadow: `0 0 22px ${accent}66` }}>{fmt(objDensity)}</span>
              <span style={{ color: T.text2, fontSize: 13, fontWeight: 600 }}>g/cm³</span>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 10, color: T.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Líquido</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, ...NUM }}>{fmt(liquido.d)} g/mL</div>
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
              background: isCustom ? `rgba(${color.rgba},0.14)` : "transparent",
              color: isCustom ? T.text : T.text2,
              boxShadow: isCustom ? `0 0 18px -4px rgba(${color.rgba},0.5)` : "none",
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
                <span style={{ fontSize: 13.5, color: T.text2, fontWeight: 700 }}>Masa</span>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 800, ...NUM }}>{fmt(customMass, 0)} g</span>
              </div>
              <input className="dx-slider" type="range" min={5} max={2000} step={5} value={customMass} onChange={(e) => setCustomMass(Number(e.target.value))} />
            </div>
          )}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, color: T.text2, fontWeight: 700 }}>Volumen</span>
              <span style={{ fontSize: 14, color: T.text, fontWeight: 800, ...NUM }}>{fmt(volume, 0)} cm³</span>
            </div>
            <input className="dx-slider" type="range" min={10} max={500} step={5} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="dx-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? C_FLOTA : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
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
            background: `rgba(${color.rgba},0.08)`,
            fontSize: 13.5,
            color: T.text2,
            lineHeight: 1.55,
            display: "flex",
            gap: 13,
          }}
        >
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            El objeto flota cuando su densidad es <strong style={{ color: T.text }}>menor</strong> que la del líquido. Por eso el
            hierro se hunde en agua… pero <strong style={{ color: T.text }}>flota en mercurio</strong>. ¡Compruébalo!
          </span>
        </div>
      </div>

      {/* ── Ejercicio de cálculo (interactividad ampliada — A6 verbatim) ───── */}
      <CalcDensidadCard
        accent={accent}
        rgba={color.rgba}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={
          sonido
            ? (ok) => {
                if (ok) audioRef.current?.correcto();
                else audioRef.current?.incorrecto();
              }
            : undefined
        }
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Ejercicio de cálculo — reproduce el problema A6 «Cálculo de densidad»
 * (verbatim) como "interactividad ampliada": el alumno calcula ρ = m/V, escribe
 * su resultado, identifica el metal y comprueba su procedimiento. Análogo a la
 * tarjeta de cálculos del laboratorio de destilación.
 * ──────────────────────────────────────────────────────────────────────── */
function CalcDensidadCard({
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
}) {
  const NO = "#FF5E5E";
  const ej = EJERCICIO_A6;
  const [valor, setValor] = useState("");
  const [metal, setMetal] = useState<string | null>(null);
  const [comprobado, setComprobado] = useState(false);

  const num = Number(valor.replace(",", "."));
  const valorOk = valor.trim() !== "" && Number.isFinite(num) && Math.abs(num - ej.respuestaValor) <= ej.tolerancia;
  const metalOk = metal === ej.metalCorrecto;
  const todoOk = valorOk && metalOk;
  const puedeComprobar = valor.trim() !== "" && metal !== null;

  const comprobar = () => {
    setComprobado(true);
    playSfx?.(todoOk);
    if (todoOk) onAprobado();
  };

  const reintentar = () => {
    setValor("");
    setMetal(null);
    setComprobado(false);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
          Resuelve el ejercicio
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Resuelto
          </span>
        )}
      </div>

      {/* Enunciado verbatim */}
      <div style={{ borderRadius: 14, border: `1px solid rgba(${rgba},0.3)`, background: `rgba(${rgba},0.08)`, padding: "14px 16px", marginTop: 6 }}>
        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.55, fontWeight: 600 }}>
          <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
          {ej.enunciado}
        </div>
        <div style={{ fontSize: 12.5, color: T.text3, marginTop: 9, fontStyle: "italic" }}>{ej.contexto}</div>
      </div>

      {/* Datos */}
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 16 }}>
        <div style={{ ...NUM }}>
          <span style={{ fontSize: 11, color: T.text3, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Masa (m)</span>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{ej.datos.masa} g</div>
        </div>
        <div style={{ ...NUM }}>
          <span style={{ fontSize: 11, color: T.text3, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Volumen (V)</span>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{ej.datos.volumen} cm³</div>
        </div>
      </div>

      {/* Respuesta numérica */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text2, marginBottom: 9 }}>
          1. Calcula la densidad (ρ = m / V):
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: T.text2 }}>ρ =</span>
          <input
            className="dx-num"
            inputMode="decimal"
            placeholder="?"
            value={valor}
            disabled={comprobado}
            onChange={(e) => setValor(e.target.value)}
            style={comprobado ? { borderColor: valorOk ? OK : NO } : undefined}
          />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text2 }}>g/cm³</span>
          {comprobado && (
            <i className={`fa-solid ${valorOk ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: valorOk ? OK : NO, fontSize: 18 }} />
          )}
        </div>
      </div>

      {/* Identificación del metal */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text2, marginBottom: 9 }}>
          2. ¿De qué metal podría tratarse?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9 }}>
          {ej.opcionesMetal.map((m) => {
            const sel = metal === m.key;
            const esCorrecta = m.key === ej.metalCorrecto;
            let borde = T.line;
            let fondo = T.glass;
            let colorTxt = T.text2;
            if (comprobado && esCorrecta) {
              borde = OK;
              fondo = `${OK}1c`;
              colorTxt = "#fff";
            } else if (comprobado && sel && !esCorrecta) {
              borde = NO;
              fondo = `${NO}1c`;
              colorTxt = "#fff";
            } else if (!comprobado && sel) {
              borde = accent;
              fondo = `rgba(${rgba},0.16)`;
              colorTxt = "#fff";
            }
            return (
              <button
                key={m.key}
                className="dx-opt"
                onClick={() => !comprobado && setMetal(m.key)}
                disabled={comprobado}
                style={{ borderColor: borde, background: fondo, color: colorTxt }}
              >
                <span style={{ flex: 1 }}>{m.label}</span>
                <span style={{ fontSize: 12, color: T.text3, ...NUM }}>{fmt(m.d)} g/cm³</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Procedimiento + resultado tras comprobar */}
      {comprobado && (
        <div style={{ marginTop: 18, borderRadius: 13, border: `1px solid ${todoOk ? OK : NO}55`, background: `${todoOk ? OK : NO}14`, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 900, color: todoOk ? OK : NO }}>
            <i className={`fa-solid ${todoOk ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {todoOk ? "¡Correcto!" : "Revisa tu procedimiento"}
          </div>
          <ol style={{ margin: "11px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {ej.pasos.map((p, i) => (
              <li key={i} style={{ fontSize: 13.5, lineHeight: 1.5, color: T.text2 }}>{p}</li>
            ))}
          </ol>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginTop: 10 }}>
            <i className="fa-solid fa-flag-checkered" style={{ marginRight: 8, color: accent }} />
            Respuesta: {ej.respuestaTexto}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="dx-play" onClick={comprobar} disabled={!puedeComprobar}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="dx-cls" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

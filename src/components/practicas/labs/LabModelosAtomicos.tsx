"use client";

/**
 * Laboratorio 3D — Modelos atómicos (de Dalton a Schrödinger).
 * Práctica experimental para CNEYT-I-P03 (el átomo, su composición eléctrica y
 * la evolución de los modelos atómicos).
 *
 * El estudiante elige un ELEMENTO y recorre los 5 MODELOS históricos; ve en 3D
 * cómo cambió la idea del átomo: de esfera maciza (Dalton) → budín de pasas
 * (Thomson) → núcleo + órbitas sin definir (Rutherford) → capas de energía
 * (Bohr) → nube de probabilidad (Schrödinger). El núcleo se arma con el número
 * real de protones y neutrones del elemento, y los electrones se reparten por
 * capas según su configuración.
 *
 * Diseño: tema oscuro "instrumento de laboratorio" coherente con PracticaRunner.
 * Si el dispositivo no soporta WebGL, un fallback 2D sigue describiendo el modelo.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import type { ModeloKey } from "./ModelosAtomicosScene";
import { T, NUM, card, Eyebrow, Readout, SceneBoundary } from "./_kit";

const ModelosAtomicosScene = dynamic(() => import("./ModelosAtomicosScene"), {
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
      <i className="fa-solid fa-atom fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const PROTON_COLOR = "#FF6B6B";
const NEUTRON_COLOR = "#9AA7B5";
const ELECTRON_COLOR = "#5BC8FF";

/* ── Modelos atómicos: evolución histórica ────────────────────────────── */
interface Modelo {
  key: ModeloKey;
  label: string;
  cientifico: string;
  year: number;
  icon: string;
  col: string;
  desc: string; // qué se ve
  aporte: string;
  limite: string;
}
const MODELOS: Modelo[] = [
  {
    key: "dalton",
    label: "Dalton",
    cientifico: "John Dalton",
    year: 1808,
    icon: "fa-circle",
    col: "#94A3B8",
    desc: "Esfera maciza, indivisible y única para cada elemento.",
    aporte: "Propone que la materia se forma de átomos: indivisibles e idénticos en cada elemento.",
    limite: "No explica la naturaleza eléctrica ni la estructura interna del átomo.",
  },
  {
    key: "thomson",
    label: "Thomson",
    cientifico: "J. J. Thomson",
    year: 1904,
    icon: "fa-cookie",
    col: "#F59E0B",
    desc: "«Budín de pasas»: esfera positiva con electrones incrustados.",
    aporte: "Descubre el electrón: el átomo es divisible y tiene carga negativa y positiva.",
    limite: "No ubica la carga positiva en un núcleo; el orden interno no es correcto.",
  },
  {
    key: "rutherford",
    label: "Rutherford",
    cientifico: "Ernest Rutherford",
    year: 1911,
    icon: "fa-bullseye",
    col: "#F472B6",
    desc: "Núcleo pequeño, denso y positivo; electrones girando en el vacío.",
    aporte: "El experimento de la lámina de oro revela un núcleo central, denso y positivo.",
    limite: "No explica por qué los electrones no caen al núcleo ni los espectros de luz.",
  },
  {
    key: "bohr",
    label: "Bohr",
    cientifico: "Niels Bohr",
    year: 1913,
    icon: "fa-atom",
    col: "#38BDF8",
    desc: "Electrones en órbitas circulares de energía definida (capas).",
    aporte: "Los electrones ocupan niveles de energía definidos; explica el espectro del hidrógeno.",
    limite: "Funciona bien para el hidrógeno, pero falla con átomos de más electrones.",
  },
  {
    key: "schrodinger",
    label: "Schrödinger",
    cientifico: "Erwin Schrödinger",
    year: 1926,
    icon: "fa-cloud",
    col: "#34D399",
    desc: "Modelo cuántico: nube de probabilidad (orbitales).",
    aporte: "Modelo cuántico: orbitales = zonas donde es más probable hallar al electrón.",
    limite: "Es abstracto y matemático; los electrones no siguen trayectorias visibles.",
  },
];

/* ── Elementos (datos reales): Z, símbolo, nombre, masa y capas ───────── */
interface Elemento {
  z: number;
  sym: string;
  nombre: string;
  masa: number; // masa atómica (u)
  shells: number[]; // electrones por capa
  color: string;
}
const ELEMENTOS: Elemento[] = [
  { z: 1, sym: "H", nombre: "Hidrógeno", masa: 1.008, shells: [1], color: "#cfe6ff" },
  { z: 2, sym: "He", nombre: "Helio", masa: 4.003, shells: [2], color: "#ffd6a5" },
  { z: 3, sym: "Li", nombre: "Litio", masa: 6.941, shells: [2, 1], color: "#d7b6ff" },
  { z: 4, sym: "Be", nombre: "Berilio", masa: 9.012, shells: [2, 2], color: "#a5f3c8" },
  { z: 5, sym: "B", nombre: "Boro", masa: 10.811, shells: [2, 3], color: "#ffc9a3" },
  { z: 6, sym: "C", nombre: "Carbono", masa: 12.011, shells: [2, 4], color: "#9aa7b5" },
  { z: 7, sym: "N", nombre: "Nitrógeno", masa: 14.007, shells: [2, 5], color: "#9fd0ff" },
  { z: 8, sym: "O", nombre: "Oxígeno", masa: 15.999, shells: [2, 6], color: "#ff9aa2" },
  { z: 9, sym: "F", nombre: "Flúor", masa: 18.998, shells: [2, 7], color: "#a5ffd6" },
  { z: 10, sym: "Ne", nombre: "Neón", masa: 20.18, shells: [2, 8], color: "#ffadd9" },
  { z: 11, sym: "Na", nombre: "Sodio", masa: 22.99, shells: [2, 8, 1], color: "#c8b6ff" },
  { z: 12, sym: "Mg", nombre: "Magnesio", masa: 24.305, shells: [2, 8, 2], color: "#b6ffd9" },
  { z: 13, sym: "Al", nombre: "Aluminio", masa: 26.982, shells: [2, 8, 3], color: "#d6dde4" },
  { z: 14, sym: "Si", nombre: "Silicio", masa: 28.086, shells: [2, 8, 4], color: "#b3bcc7" },
  { z: 15, sym: "P", nombre: "Fósforo", masa: 30.974, shells: [2, 8, 5], color: "#ffcf99" },
  { z: 16, sym: "S", nombre: "Azufre", masa: 32.06, shells: [2, 8, 6], color: "#ffe28a" },
  { z: 17, sym: "Cl", nombre: "Cloro", masa: 35.45, shells: [2, 8, 7], color: "#bdf5a3" },
  { z: 18, sym: "Ar", nombre: "Argón", masa: 39.948, shells: [2, 8, 8], color: "#c3a3ff" },
  { z: 19, sym: "K", nombre: "Potasio", masa: 39.098, shells: [2, 8, 8, 1], color: "#dabfff" },
  { z: 20, sym: "Ca", nombre: "Calcio", masa: 40.078, shells: [2, 8, 8, 2], color: "#a8f0c0" },
];

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ── Componentes de UI (declarados fuera del render: estado estable) ──── */

// Tile de modelo histórico (seleccionable)
const ModelTile = ({
  active,
  modelo,
  onClick,
}: {
  active: boolean;
  modelo: Modelo;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="ex-tile"
    data-on={active}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "11px 13px",
      textAlign: "left",
      cursor: "pointer",
      borderRadius: 13,
      border: active ? `1.5px solid ${modelo.col}` : `1px solid ${T.line}`,
      background: active ? `${modelo.col}1f` : T.glass,
      boxShadow: active ? `0 0 18px -4px ${modelo.col}` : "none",
      transition: "all 0.16s ease",
      width: "100%",
    }}
  >
    <span
      style={{
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        color: active ? "#fff" : modelo.col,
        background: active ? modelo.col : `${modelo.col}22`,
        boxShadow: active ? `0 6px 16px -6px ${modelo.col}` : "none",
      }}
    >
      <i className={`fa-solid ${modelo.icon}`} />
    </span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>
        {modelo.label} <span style={{ fontSize: 11.5, fontWeight: 600, color: T.text3, ...NUM }}>· {modelo.year}</span>
      </span>
      <span style={{ display: "block", fontSize: 11.5, color: T.text3 }}>{modelo.cientifico}</span>
    </span>
    {active && <i className="fa-solid fa-check" style={{ fontSize: 12, color: modelo.col }} />}
  </button>
);

// Punto de la leyenda de partículas
const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: T.text2, fontWeight: 600 }}>
    <span style={{ width: 11, height: 11, borderRadius: "50%", background: color, boxShadow: `0 0 8px -1px ${color}` }} />
    {label}
  </span>
);

/* ── Línea del tiempo de los modelos: el "porqué" de la evolución ─────── */
const Timeline = ({ activo, onPick }: { activo: ModeloKey; onPick: (k: ModeloKey) => void }) => {
  const idxActivo = MODELOS.findIndex((m) => m.key === activo);
  return (
    <div>
      <Eyebrow>Línea del tiempo de los modelos</Eyebrow>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* línea base */}
        <div style={{ position: "absolute", left: 16, right: 16, top: 16, height: 2, background: T.lineStrong }} />
        {/* progreso recorrido */}
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            height: 2,
            width: `calc((100% - 32px) * ${idxActivo / (MODELOS.length - 1)})`,
            background: MODELOS[idxActivo]!.col,
            boxShadow: `0 0 10px -1px ${MODELOS[idxActivo]!.col}`,
            transition: "width 0.4s ease, background 0.3s ease",
          }}
        />
        {MODELOS.map((m, i) => {
          const on = i <= idxActivo;
          const isActivo = m.key === activo;
          return (
            <button
              key={m.key}
              onClick={() => onPick(m.key)}
              style={{
                position: "relative",
                zIndex: 1,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span
                style={{
                  width: isActivo ? 34 : 24,
                  height: isActivo ? 34 : 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isActivo ? 14 : 11,
                  color: on ? "#fff" : T.text3,
                  background: on ? m.col : T.inset,
                  border: `2px solid ${on ? m.col : T.lineStrong}`,
                  boxShadow: isActivo ? `0 0 16px -2px ${m.col}` : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <i className={`fa-solid ${m.icon}`} />
              </span>
              <span style={{ fontSize: 10.5, fontWeight: isActivo ? 800 : 600, color: isActivo ? T.text : T.text3, ...NUM }}>{m.year}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Aporte y límite del modelo activo ────────────────────────────────── */
const AporteLimite = ({ modelo }: { modelo: Modelo }) => (
  <div>
    <Eyebrow>Aporte y límite del modelo</Eyebrow>
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-plus" style={{ color: "#34D399", fontSize: 15, marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Aporta:</strong> {modelo.aporte}
        </p>
      </div>
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-exclamation" style={{ color: "#FBBF24", fontSize: 15, marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Su límite:</strong> {modelo.limite}
        </p>
      </div>
    </div>
  </div>
);

export function LabModelosAtomicos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modeloKey, setModeloKey] = useState<ModeloKey>("dalton");
  const [elementoSym, setElementoSym] = useState("C");
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [visitados, setVisitados] = useState<Set<ModeloKey>>(() => new Set<ModeloKey>(["dalton"]));

  const modelo = MODELOS.find((m) => m.key === modeloKey)!;
  const elemento = ELEMENTOS.find((e) => e.sym === elementoSym)!;
  const idxModelo = MODELOS.findIndex((m) => m.key === modeloKey);

  // Composición: A = masa redondeada (número másico del isótopo más común).
  const A = Math.round(elemento.masa);
  const protones = elemento.z;
  const neutrones = Math.max(0, A - elemento.z);
  const electrones = elemento.z;

  const irAModelo = (k: ModeloKey) => {
    setModeloKey(k);
    setVisitados((prev) => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };
  const paso = (dir: number) => {
    const i = Math.max(0, Math.min(MODELOS.length - 1, idxModelo + dir));
    irAModelo(MODELOS[i]!.key);
  };

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  const objetivos = [
    { txt: "Recorre los 5 modelos atómicos", done: visitados.size === MODELOS.length },
    { txt: "Observa el núcleo (de Rutherford en adelante)", done: ["rutherford", "bohr", "schrodinger"].includes(modeloKey) },
    { txt: "Identifica las capas de energía (Bohr)", done: modeloKey === "bohr" },
    { txt: "Llega al modelo cuántico (Schrödinger)", done: modeloKey === "schrodinger" },
  ];

  const muestraNucleo = modeloKey === "rutherford" || modeloKey === "bohr" || modeloKey === "schrodinger";

  // Fallback 2D cuando no hay WebGL
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
          background: modelo.col,
          boxShadow: `0 10px 30px -6px ${modelo.col}`,
        }}
      >
        <i className={`fa-solid ${modelo.icon}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>
        Modelo de {modelo.label} <span style={{ color: T.text3, fontWeight: 700 }}>({modelo.year})</span>
      </div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 340, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue: {modelo.desc} Elemento:{" "}
        <strong style={{ color: T.text }}>{elemento.nombre}</strong> (Z = {protones}).
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-tile:hover { border-color:${T.lineStrong} !important; background:${T.glassSoft} !important; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-elem { cursor:pointer; aspect-ratio:1; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; transition:all .14s ease; padding:2px; }
        .ex-elem:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-elem[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -5px rgba(${color.rgba},0.7); }
        .ex-step { cursor:pointer; flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px;
          border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:13px; font-weight:700; transition:all .15s; }
        .ex-step:hover:not(:disabled) { color:#fff; border-color:${T.lineStrong}; }
        .ex-step:disabled { opacity:0.35; cursor:not-allowed; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ex-grid">
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
              <ModelosAtomicosScene
                modelo={modeloKey}
                protones={protones}
                neutrones={neutrones}
                electrones={electrones}
                shells={elemento.shells}
                elementColor={elemento.color}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO + modelo */}
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
                border: `1px solid ${modelo.col}66`,
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                className="ex-live-dot"
                style={{ ["--exc" as string]: `${modelo.col}aa`, width: 9, height: 9, borderRadius: "50%", background: modelo.col }}
              />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <i className={`fa-solid ${modelo.icon}`} style={{ fontSize: 12, color: modelo.col }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.text }}>
                {modelo.label} <span style={{ color: T.text3, fontWeight: 600, ...NUM }}>· {modelo.year}</span>
              </span>
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
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={() => setResetNonce((n) => n + 1)} title="Reiniciar partículas">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Elemento grande (esquina inferior derecha) */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                right: 16,
                textAlign: "right",
                pointerEvents: "none",
                background: "rgba(2,12,28,0.6)",
                padding: "8px 14px",
                borderRadius: 13,
                backdropFilter: "blur(6px)",
                border: `1px solid rgba(${color.rgba},0.3)`,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: T.text, lineHeight: 1, textShadow: `0 0 18px rgba(${color.rgba},0.5)` }}>
                {elemento.sym}
              </div>
              <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, marginTop: 2, ...NUM }}>
                {elemento.nombre} · Z {elemento.z}
              </div>
            </div>

            {/* Leyenda de partículas (solo cuando se ven) */}
            {muestraNucleo && (
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 16,
                  display: "flex",
                  gap: 14,
                  pointerEvents: "none",
                  background: "rgba(2,12,28,0.6)",
                  padding: "7px 13px",
                  borderRadius: 999,
                  backdropFilter: "blur(6px)",
                }}
              >
                <LegendDot color={PROTON_COLOR} label="Protón" />
                <LegendDot color={NEUTRON_COLOR} label="Neutrón" />
                <LegendDot color={ELECTRON_COLOR} label="Electrón" />
              </div>
            )}
          </div>

          {/* Lectura del experimento: línea del tiempo + aporte/límite */}
          <div style={{ ...card, padding: "20px 22px" }}>
            <Timeline activo={modeloKey} onPick={irAModelo} />
            <div className="ex-divider" />
            <AporteLimite modelo={modelo} />
          </div>
        </div>

        {/* ── Columna controles (panel único) ────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Modelo actual */}
          <Eyebrow>Modelo actual</Eyebrow>
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${modelo.col}55`,
              background: `${modelo.col}14`,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                flexShrink: 0,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#fff",
                background: modelo.col,
                boxShadow: `0 8px 22px -6px ${modelo.col}`,
              }}
            >
              <i className={`fa-solid ${modelo.icon}`} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>
                {modelo.label} <span style={{ fontSize: 13, fontWeight: 700, color: T.text3, ...NUM }}>· {modelo.year}</span>
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, marginTop: 3 }}>{modelo.desc}</div>
            </div>
          </div>

          {/* Pasos prev / next */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="ex-step" onClick={() => paso(-1)} disabled={idxModelo === 0}>
              <i className="fa-solid fa-arrow-left" /> Anterior
            </button>
            <button className="ex-step" onClick={() => paso(1)} disabled={idxModelo === MODELOS.length - 1}>
              Siguiente <i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <div className="ex-divider" />

          {/* Modelo (lista histórica) */}
          <Eyebrow>Modelos históricos</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODELOS.map((m) => (
              <ModelTile key={m.key} active={m.key === modeloKey} modelo={m} onClick={() => irAModelo(m.key)} />
            ))}
          </div>

          <div className="ex-divider" />

          {/* Elemento */}
          <Eyebrow>Elemento</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {ELEMENTOS.map((e) => (
              <button key={e.sym} className="ex-elem" data-on={e.sym === elementoSym} onClick={() => setElementoSym(e.sym)} title={`${e.nombre} (Z=${e.z})`}>
                <span style={{ fontSize: 9, color: T.text3, ...NUM, lineHeight: 1 }}>{e.z}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: e.sym === elementoSym ? "#fff" : T.text2, lineHeight: 1.05 }}>{e.sym}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Lecturas instrumento: composición */}
          <Eyebrow>Composición del átomo</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Protones" value={fmt(protones)} col={PROTON_COLOR} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Neutrones" value={fmt(neutrones)} col={NEUTRON_COLOR} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Electrones" value={fmt(electrones)} col={ELECTRON_COLOR} />
          </div>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 9 }}>
            <Readout label="N.º atómico (Z)" value={fmt(protones)} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Masa atómica" value={fmt(elemento.masa, 2)} unit="u" />
          </div>

          {/* Configuración por capas */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>
                Electrones por capa
              </span>
              <span style={{ fontSize: 11, color: T.text3 }}>{elemento.shells.length} {elemento.shells.length === 1 ? "capa" : "capas"}</span>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {elemento.shells.map((c, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: `${ELECTRON_COLOR}1a`,
                    border: `1px solid ${ELECTRON_COLOR}40`,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: T.text,
                    ...NUM,
                  }}
                >
                  <span style={{ fontSize: 10, color: T.text3 }}>n{i + 1}</span> {c} e⁻
                </span>
              ))}
            </div>
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
            Cada modelo no «borra» al anterior: lo <strong style={{ color: T.text }}>corrige y amplía</strong>. La ciencia avanza así,
            con evidencia nueva. Cambia de elemento y observa cómo crece el <strong style={{ color: T.text }}>núcleo</strong> y se llenan
            las <strong style={{ color: T.text }}>capas</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

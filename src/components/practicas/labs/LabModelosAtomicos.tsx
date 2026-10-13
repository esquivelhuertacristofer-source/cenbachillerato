"use client";

/**
 * Laboratorio 3D — Modelos atómicos (de Dalton a Schrödinger).
 * Práctica experimental para CNEYT-I-P03 (el átomo, su composición eléctrica y
 * la evolución de los modelos atómicos).
 *
 * LA HISTORIA DEL ÁTOMO COMO UN VIAJE. Cada modelo es un modo y la cámara
 * viaja de uno al siguiente:
 *   · DALTON: esfera maciza e indivisible, pulida.
 *   · THOMSON: «budín» positivo translúcido con electrones incrustados.
 *   · RUTHERFORD: el EXPERIMENTO de la lámina de oro, animado y con
 *     estadística de Coulomb real; zoom del aparato a la lámina y al núcleo.
 *   · BOHR: hidrógeno con órbitas r ∝ n²; el alumno sube y baja el electrón y
 *     ve el fotón con su color real; el espectro de Balmer se va dibujando.
 *   · SCHRÖDINGER: nubes de probabilidad |ψ|² de orbitales s, p y d.
 *   · CONSTRUIR ÁTOMO: cada protón cambia el ELEMENTO; los electrones inclinan
 *     la BALANZA DE CARGA (neutro, catión, anión); los neutrones dan isótopos.
 *
 * Si el dispositivo no soporta WebGL, un fallback 2D sigue describiendo el modelo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import type { ModeloKey, VistaEscena } from "./ModelosAtomicosScene";
import type { StatsRutherford } from "./modelos-atomicos-rutherford";
import type { TransicionBohr } from "./modelos-atomicos-bohr";
import type { VistaOrbital } from "./modelos-atomicos-orbitales";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta, Deslizador } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { MODELOS_ATOMICOS_FICHA } from "./modelos-atomicos-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./modelos-atomicos-data";
import { LabSfx } from "./lab-audio";
import {
  A0_PM,
  LINEAS_BALMER,
  METALES,
  N_MAX_BOHR,
  colorDeLongitud,
  configuracion,
  distanciaMinimaFm,
  energiaBohr,
  energiaFoton,
  fraccionesTeoricas,
  longitudOndaNm,
  probMayorQue,
  radio90,
  radioBohrPm,
  regionEspectral,
  serieEspectral,
  textoConfiguracion,
} from "./modelos-atomicos-fisica";

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
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
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

/* ── Constructor de átomos: límites y reparto de capas ─────────────────── */
type Particula = "p" | "n" | "e";
const MAX_P = 20; // hasta Z=20 (Ca), el alcance de la tabla del laboratorio
const MAX_N = 26;
const MAX_E = 22;

// Capacidad de cada capa (regla 2-8-18…) para repartir electrones al construir.
const CAPACIDAD = [2, 8, 18, 32, 32, 18, 8];
function repartirCapas(e: number): number[] {
  const out: number[] = [];
  let rest = e;
  for (const cap of CAPACIDAD) {
    if (rest <= 0) break;
    const n = Math.min(cap, rest);
    out.push(n);
    rest -= n;
  }
  return out.length ? out : [0];
}

const PARTICULAS: { tipo: Particula; label: string; color: string; carga: string; desc: string }[] = [
  { tipo: "p", label: "Protón", color: PROTON_COLOR, carga: "+1", desc: "Define el elemento (núcleo)" },
  { tipo: "n", label: "Neutrón", color: NEUTRON_COLOR, carga: "0", desc: "Aporta masa (núcleo)" },
  { tipo: "e", label: "Electrón", color: ELECTRON_COLOR, carga: "−1", desc: "Orbita en las capas" },
];

/* ── Componentes de UI (declarados fuera del render: estado estable) ──── */

// Punto de la leyenda de partículas
const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: T.text2, fontWeight: 600 }}>
    <span style={{ width: 11, height: 11, borderRadius: "50%", background: color, boxShadow: `0 0 8px -1px ${color}` }} />
    {label}
  </span>
);

/* ── Línea del tiempo de los modelos: el "porqué" de la evolución ─────── */
const Timeline = ({ activo, onPick }: { activo: ModeloKey; onPick: (k: ModeloKey) => void }) => {
  const idxActivo = MODELOS.findIndex((m) => m.key === activo);
  return (
    <div>
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
              <span style={{ fontSize: 14, fontWeight: isActivo ? 800 : 600, color: isActivo ? T.text : T.text3, ...NUM }}>{m.year}</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-plus" style={{ color: "#34D399", fontSize: 15, marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Aporta:</strong> {modelo.aporte}
        </p>
      </div>
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-exclamation" style={{ color: "#FBBF24", fontSize: 15, marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Su límite:</strong> {modelo.limite}
        </p>
      </div>
    </div>
  </div>
);

/* ── Balanza de carga: protones (+) contra electrones (−). EL medidor del experimento ──
 * Se inclina hacia el lado que pesa más: si sobran protones es catión; si sobran
 * electrones, anión; en equilibrio, el átomo es neutro. */
const BalanzaCarga = ({ p, e, compacto = false }: { p: number; e: number; compacto?: boolean }) => {
  const dif = p - e;
  const a = (Math.max(-4, Math.min(4, dif)) * 7 * Math.PI) / 180; // >0: protones abajo (izquierda)
  const cx = 100, cy = 34, L = 66;
  const lx = cx - L * Math.cos(a), ly = cy + L * Math.sin(a);
  const rx = cx + L * Math.cos(a), ry = cy - L * Math.sin(a);
  const estado = p === 0 && e === 0 ? "Vacío" : dif === 0 ? "Neutro" : dif > 0 ? `Catión +${dif}` : `Anión ${dif}`;
  const col = p === 0 && e === 0 ? T.text3 : dif === 0 ? "#34D399" : dif > 0 ? PROTON_COLOR : ELECTRON_COLOR;
  return (
    <div style={{ display: "grid", gap: 2, width: "100%" }}>
      <svg viewBox="0 0 200 104" role="img" aria-label={`Balanza de carga: ${p} protones, ${e} electrones, ${estado}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <polygon points={`${cx - 12},96 ${cx + 12},96 ${cx},${cy}`} fill="rgba(255,255,255,0.18)" />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="rgba(255,255,255,0.75)" strokeWidth={4} strokeLinecap="round" style={{ transition: "all .25s ease" }} />
        <circle cx={cx} cy={cy} r={5} fill="#fff" />
        <line x1={lx} y1={ly} x2={lx} y2={ly + 14} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
        <line x1={rx} y1={ry} x2={rx} y2={ry + 14} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
        <circle cx={lx} cy={ly + 30} r={17} fill={PROTON_COLOR} style={{ transition: "all .25s ease" }} />
        <circle cx={rx} cy={ry + 30} r={17} fill={ELECTRON_COLOR} style={{ transition: "all .25s ease" }} />
        <text x={lx} y={ly + 36} textAnchor="middle" fontSize={17} fontWeight={900} fill="#06121f" style={{ transition: "all .25s ease" }}>{p}</text>
        <text x={rx} y={ry + 36} textAnchor="middle" fontSize={17} fontWeight={900} fill="#06121f" style={{ transition: "all .25s ease" }}>{e}</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span style={{ color: PROTON_COLOR }}>protones +</span>
        <span style={{ color: col }}>{estado}</span>
        {!compacto && <span style={{ color: ELECTRON_COLOR }}>− electrones</span>}
      </div>
    </div>
  );
};

const CSS_MA = `
.ex-tile:hover { border-color:${T.lineStrong} !important; background:${T.glassSoft} !important; }
.ex-elem { cursor:pointer; aspect-ratio:1; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; transition:all .14s ease; padding:2px; min-width:0; }
.ex-elem:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
.ex-step { cursor:pointer; flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px;
  border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:700; transition:all .15s; }
.ex-step:hover:not(:disabled) { color:#fff; border-color:${T.lineStrong}; }
.ex-step:disabled { opacity:0.35; cursor:not-allowed; }
.ma-chip { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:13px; border:1px solid ${T.line};
  background:${T.glass}; cursor:grab; transition:all .14s ease; user-select:none; }
.ma-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; transform:translateY(-1px); }
.ma-chip:active { cursor:grabbing; transform:scale(0.98); }
.ma-orb { width:34px; height:34px; flex-shrink:0; border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-size:14px; font-weight:900; color:#06121f; }
.ma-pm { width:34px; height:34px; border-radius:9px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text};
  font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .14s; }
.ma-pm:disabled { opacity:0.3; cursor:not-allowed; }
`;

const CSS_VIAJE = `
.ma-seg { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 92px), 1fr)); gap:6px; }
.ma-op { cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; padding:10px 8px; border-radius:11px;
  border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; min-width:0; }
.ma-op:hover { color:#fff; border-color:${T.lineStrong}; }
.ma-op[data-on="true"] { color:#04121f; background:var(--lsa); border-color:var(--lsa); }
.ma-op:disabled { opacity:0.35; cursor:not-allowed; }
.ma-orbs { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 64px), 1fr)); gap:6px; }
.ma-nota { margin:0; font-size:14px; line-height:1.5; color:${T.text2}; padding:11px 13px; border-radius:12px;
  background:rgba(2,12,28,0.5); border:1px solid ${T.line}; }
.ma-nota strong { color:#fff; }
.ma-check { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700; color:${T.text2}; cursor:pointer; }
.ma-check input { width:20px; height:20px; accent-color:var(--lsa); cursor:pointer; }
.ma-cifras { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
`;

const RETO_KEY = "cen-modelos-atomicos-reto";

/* ── Tira espectral: 380–750 nm, las líneas aparecen al emitirse ─────── */
const NM_MIN = 380;
const NM_MAX = 750;
const ARCOIRIS = `linear-gradient(90deg, ${Array.from({ length: 38 }, (_, i) => {
  const nm = NM_MIN + i * 10;
  return `${colorDeLongitud(nm)} ${(((nm - NM_MIN) / (NM_MAX - NM_MIN)) * 100).toFixed(1)}%`;
}).join(", ")})`;

const EspectroTira = ({ lineas, grande = false }: { lineas: number[]; grande?: boolean }) => {
  const visibles = [...new Set(lineas.filter((nm) => nm >= NM_MIN && nm <= NM_MAX))].sort((a, b) => a - b);
  const x = (nm: number) => ((nm - NM_MIN) / (NM_MAX - NM_MIN)) * 100;
  return (
    <div style={{ width: "100%" }}>
      <div
        role="img"
        aria-label={`Espectro de emisión: ${visibles.length ? visibles.map((v) => `${v} nm`).join(", ") : "sin líneas aún"}`}
        style={{ position: "relative", height: grande ? 46 : 30, borderRadius: 8, overflow: "hidden", background: "#020409", border: `1px solid ${T.line}` }}
      >
        <div style={{ position: "absolute", inset: 0, background: ARCOIRIS, opacity: 0.13 }} />
        {visibles.map((nm) => (
          <div
            key={nm}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `calc(${x(nm)}% - 2px)`,
              width: 4,
              background: colorDeLongitud(nm),
              boxShadow: `0 0 10px 2px ${colorDeLongitud(nm)}`,
              animation: "maLinea .6s ease",
            }}
          />
        ))}
      </div>
      {grande && (
        <div style={{ position: "relative", height: 40, marginTop: 4 }}>
          {visibles.map((nm, i) => (
            <span
              key={nm}
              style={{
                position: "absolute",
                top: i % 2 === 0 ? 0 : 19,
                left: `${x(nm)}%`,
                transform: "translateX(-50%)",
                fontSize: 14,
                fontWeight: 800,
                color: colorDeLongitud(nm),
                ...NUM,
                whiteSpace: "nowrap",
              }}
            >
              {nm}
            </span>
          ))}
        </div>
      )}
      {!grande && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: T.text3, marginTop: 3, ...NUM }}>
          <span>380 nm</span>
          <span>{visibles.length}/4 Balmer</span>
          <span>750 nm</span>
        </div>
      )}
    </div>
  );
};

/* ── Escalera de energía del hidrógeno (escala lineal real) ─────────── */
const EscaleraEnergia = ({ nivel, ultima }: { nivel: number; ultima: TransicionBohr | null }) => {
  const W = 300, H = 200, top = 26, bot = 186;
  const y = (n: number) => top + (energiaBohr(n) / energiaBohr(1)) * (bot - top);
  const xL = 104, xR = 296, xCorto = 226;
  const nm = ultima ? longitudOndaNm(ultima.de, ultima.a) : 0;
  const xF = xL + 64;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Niveles de energía; el electrón está en n = ${nivel}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <line x1={xL} y1={top - 12} x2={xR} y2={top - 12} stroke="rgba(255,255,255,0.35)" strokeDasharray="4 4" />
      <text x={xL - 8} y={top - 8} textAnchor="end" fontSize={13} fill={T.text3} fontWeight={700}>0 eV libre</text>
      {Array.from({ length: N_MAX_BOHR }, (_, i) => i + 1).map((n) => (
        <g key={n}>
          <line x1={xL} y1={y(n)} x2={n >= 4 ? xCorto : xR} y2={y(n)} stroke={n === nivel ? "#5BC8FF" : "rgba(255,255,255,0.4)"} strokeWidth={n === nivel ? 3 : 1.5} />
          {n <= 3 && (
            <text x={xL - 8} y={y(n) + 5} textAnchor="end" fontSize={14} fontWeight={800} fill={n === nivel ? "#5BC8FF" : T.text2}>
              n={n} · {energiaBohr(n).toLocaleString("es-MX", { maximumFractionDigits: 2 })}
            </text>
          )}
        </g>
      ))}
      <text x={xR} y={y(5) + 5} textAnchor="end" fontSize={13} fontWeight={800} fill={nivel >= 4 ? "#5BC8FF" : T.text3}>n = 4, 5, 6</text>
      {ultima && (
        <g>
          <line x1={xF} y1={y(ultima.de)} x2={xF} y2={y(ultima.a)} stroke={colorDeLongitud(nm)} strokeWidth={3} />
          <polygon
            points={ultima.a < ultima.de
              ? `${xF - 6},${y(ultima.a) - 9} ${xF + 6},${y(ultima.a) - 9} ${xF},${y(ultima.a)}`
              : `${xF - 6},${y(ultima.a) + 9} ${xF + 6},${y(ultima.a) + 9} ${xF},${y(ultima.a)}`}
            fill={colorDeLongitud(nm)}
          />
          <text x={xF + 12} y={Math.max(y(ultima.de), y(ultima.a)) - 8} fontSize={14} fontWeight={800} fill={colorDeLongitud(nm)}>
            {Math.round(nm)} nm
          </text>
        </g>
      )}
      <circle cx={nivel >= 4 ? xCorto - 14 : xR - 16} cy={y(nivel)} r={7} fill="#5BC8FF" />
    </svg>
  );
};

/* ── Histograma de ángulos (escala logarítmica) vs. predicción ──────── */
const ETIQ_BINS = ["0–2°", "2–10°", "10–30°", "30–60°", "60–90°", ">90°"];
const Histograma = ({ hist, teoria, total }: { hist: number[]; teoria: number[]; total: number }) => {
  const W = 300, H = 160, base = 124, alto = 104;
  const maxLog = Math.max(1, Math.log10(Math.max(10, total)));
  const h = (v: number) => (v <= 0 ? 0 : (Math.max(0, Math.log10(v) + 1) / (maxLog + 1)) * alto);
  const bw = W / hist.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Partículas por ángulo de desviación" style={{ width: "100%", height: "auto", display: "block" }}>
      {hist.map((v, i) => {
        const hh = h(v);
        const esperado = teoria[i]! * total;
        const he = h(esperado);
        const col = i >= 5 ? "#ff6b5a" : i >= 3 ? "#ffb347" : i >= 2 ? "#ffe08a" : "#9fd8ff";
        return (
          <g key={i}>
            <rect x={i * bw + 6} y={base - hh} width={bw - 12} height={hh} rx={4} fill={col} opacity={0.88} />
            {total > 0 && esperado >= 0.1 && <line x1={i * bw + 3} x2={i * bw + bw - 3} y1={base - he} y2={base - he} stroke="#fff" strokeWidth={2.5} strokeDasharray="5 3" />}
            <text x={i * bw + bw / 2} y={base - hh - 5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">
              {v > 0 ? (v >= 10000 ? `${Math.round(v / 1000)}k` : v) : ""}
            </text>
            <text x={i * bw + bw / 2} y={base + 18} textAnchor="middle" fontSize={13} fontWeight={700} fill={T.text2}>{ETIQ_BINS[i]}</text>
          </g>
        );
      })}
      <line x1={0} x2={W} y1={base} y2={base} stroke="rgba(255,255,255,0.3)" />
      <text x={W} y={H - 2} textAnchor="end" fontSize={13} fill={T.text3}>‐ ‐ predicción de Rutherford (escala log)</text>
    </svg>
  );
};

const ORBITALES_UI: { grupo: string; ops: { id: VistaOrbital; label: string }[] }[] = [
  { grupo: "s (esférico)", ops: [{ id: "1s", label: "1s" }, { id: "2s", label: "2s" }, { id: "3s", label: "3s" }] },
  { grupo: "p (dos lóbulos)", ops: [{ id: "2px", label: "2pₓ" }, { id: "2py", label: "2p_y" }, { id: "2pz", label: "2p_z" }, { id: "2p", label: "los 3" }] },
  {
    grupo: "d (cuatro lóbulos)",
    ops: [
      { id: "3dxy", label: "d_xy" }, { id: "3dxz", label: "d_xz" }, { id: "3dyz", label: "d_yz" },
      { id: "3dx2y2", label: "d_x²−y²" }, { id: "3dz2", label: "d_z²" }, { id: "3d", label: "los 5" },
    ],
  },
];
const NL_ORB: Record<string, { n: number; l: number }> = {
  "1s": { n: 1, l: 0 }, "2s": { n: 2, l: 0 }, "3s": { n: 3, l: 0 },
  "2px": { n: 2, l: 1 }, "2py": { n: 2, l: 1 }, "2pz": { n: 2, l: 1 }, "2p": { n: 2, l: 1 },
  "3dxy": { n: 3, l: 2 }, "3dxz": { n: 3, l: 2 }, "3dyz": { n: 3, l: 2 }, "3dx2y2": { n: 3, l: 2 }, "3dz2": { n: 3, l: 2 }, "3d": { n: 3, l: 2 },
};
const nombreVistaOrbital = (v: VistaOrbital) =>
  v === "atomo" ? "átomo completo" : v === "2p" ? "2p (los tres)" : v === "3d" ? "3d (los cinco)" : (ORBITALES_UI.flatMap((g) => g.ops).find((o) => o.id === v)?.label ?? v).replace(/^d_/, "3d_");

type Modo = ModeloKey | "construir";

export function LabModelosAtomicos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("dalton");
  const [modeloKey, setModeloKey] = useState<ModeloKey>("dalton");
  const [elementoSym, setElementoSym] = useState("C");
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [visitados, setVisitados] = useState<Set<ModeloKey>>(() => new Set<ModeloKey>(["dalton"]));
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // Constructor de átomos (modo "construir"): el alumno arrastra partículas.
  const [bp, setBp] = useState(0); // protones armados
  const [bn, setBn] = useState(0); // neutrones armados
  const [be, setBe] = useState(0); // electrones armados
  const [dragOver, setDragOver] = useState(false);
  const [logros, setLogros] = useState<Set<string>>(() => new Set<string>());
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Rutherford: el experimento de la lámina de oro
  const [etapa, setEtapa] = useState<0 | 1 | 2>(0);
  const [metalId, setMetalId] = useState("Au");
  const [kMeV, setKMeV] = useState(7.7);
  const [grosorUm, setGrosorUm] = useState(1);
  const [disparando, setDisparando] = useState(true);
  const [logRitmo, setLogRitmo] = useState(1.6);
  const [limpiarNonce, setLimpiarNonce] = useState(0);
  const [statsR, setStatsR] = useState<StatsRutherford>({ disparadas: 0, rectas: 0, desviadas: 0, rebotes: 0, hist: [0, 0, 0, 0, 0, 0] });

  // Bohr: saltos del electrón del hidrógeno
  const [nivel, setNivel] = useState(3);
  const [transicion, setTransicion] = useState<TransicionBohr | null>(null);
  const [lineas, setLineas] = useState<number[]>([]); // longitudes de onda emitidas (nm)
  const [balmerVistas, setBalmerVistas] = useState<number[]>([]); // n de origen de las líneas de Balmer vistas
  const [bohrCapas, setBohrCapas] = useState(false);

  // Schrödinger: orbitales
  const [orbital, setOrbital] = useState<VistaOrbital>("2pz");
  const [separar, setSeparar] = useState(0);
  const [fases, setFases] = useState(true);
  const [nodos, setNodos] = useState(false);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const modelo = MODELOS.find((m) => m.key === modeloKey)!;
  const elemento = ELEMENTOS.find((e) => e.sym === elementoSym)!;
  const idxModelo = MODELOS.findIndex((m) => m.key === modeloKey);
  const enConstruccion = modo === "construir";
  const metal = METALES.find((m) => m.id === metalId) ?? METALES[0]!;
  const ritmo = Math.round(Math.pow(10, logRitmo));

  // ── Identidad del átomo que el alumno está armando ──────────────────
  const elementoConstruido = ELEMENTOS.find((e) => e.z === bp) ?? null;
  const carga = bp - be; // >0 catión, <0 anión, 0 neutro
  const numMasaConstruido = bp + bn;
  const isotopoComun = elementoConstruido ? Math.round(elementoConstruido.masa) : 0;
  const esIsotopo = !!elementoConstruido && bp > 0 && numMasaConstruido !== isotopoComun;
  const shellsConstruido =
    elementoConstruido && be === bp ? elementoConstruido.shells : repartirCapas(be);

  // Composición efectiva (lo que se manda a la escena 3D):
  // en los modelos = elemento real; en "construir" = lo que armó el alumno.
  const A = Math.round(elemento.masa);
  const protones = enConstruccion ? bp : elemento.z;
  const neutrones = enConstruccion ? bn : Math.max(0, A - elemento.z);
  const electrones = enConstruccion ? be : elemento.z;
  const shells = enConstruccion ? shellsConstruido : elemento.shells;

  // Registra un logro del constructor (una sola vez) + sonido de acierto.
  const marcarLogro = useCallback(
    (id: string) => {
      setLogros((prev) => {
        if (prev.has(id)) return prev;
        if (sonido) audioRef.current?.correcto();
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [sonido],
  );

  // Evalúa los logros con los conteos resultantes (se llama tras cada cambio).
  const evaluarLogros = useCallback(
    (p: number, n: number, e: number) => {
      if (p > 0) marcarLogro("primer-proton");
      if (p > 0 && p === e) marcarLogro("neutro");
      if (p > 0 && p !== e) marcarLogro("ion");
      const el = ELEMENTOS.find((x) => x.z === p);
      if (el && p > 0 && p + n !== Math.round(el.masa)) marcarLogro("isotopo");
    },
    [marcarLogro],
  );

  // Agrega una partícula (por arrastre o por clic).
  const agregar = useCallback(
    (tipo: Particula) => {
      if (sonido) audioRef.current?.blip();
      let p = bp, n = bn, e = be;
      if (tipo === "p") p = Math.min(MAX_P, bp + 1);
      else if (tipo === "n") n = Math.min(MAX_N, bn + 1);
      else e = Math.min(MAX_E, be + 1);
      setBp(p);
      setBn(n);
      setBe(e);
      evaluarLogros(p, n, e);
    },
    [bp, bn, be, sonido, evaluarLogros],
  );

  const quitar = useCallback(
    (tipo: Particula) => {
      let p = bp, n = bn, e = be;
      if (tipo === "p") p = Math.max(0, bp - 1);
      else if (tipo === "n") n = Math.max(0, bn - 1);
      else e = Math.max(0, be - 1);
      setBp(p);
      setBn(n);
      setBe(e);
      evaluarLogros(p, n, e);
    },
    [bp, bn, be, evaluarLogros],
  );

  const vaciar = useCallback(() => {
    setBp(0);
    setBn(0);
    setBe(0);
  }, []);

  const conteo = (tipo: Particula) => (tipo === "p" ? bp : tipo === "n" ? bn : be);

  const retosConstructor = [
    { id: "primer-proton", txt: "Arrastra tu primer protón al núcleo" },
    { id: "neutro", txt: "Arma un átomo neutro (protones = electrones)" },
    { id: "ion", txt: "Forma un ion (quita o agrega electrones)" },
    { id: "isotopo", txt: "Crea un isótopo (cambia los neutrones)" },
  ];

  const irAModelo = (k: ModeloKey) => {
    setModeloKey(k);
    setModo(k);
    if (sonido) audioRef.current?.blip();
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

  const cambiarModo = (m: Modo) => {
    if (m === "construir") {
      setModo(m);
      if (sonido) audioRef.current?.blip();
    } else irAModelo(m);
  };

  // ── Bohr: un salto de nivel (emite si baja, absorbe si sube) ──────────
  const saltar = (a: number) => {
    const destino = Math.max(1, Math.min(N_MAX_BOHR, a));
    if (destino === nivel) return;
    const t: TransicionBohr = { de: nivel, a: destino, id: (transicion?.id ?? 0) + 1 };
    setTransicion(t);
    setNivel(destino);
    if (destino < nivel) {
      const nm = Math.round(longitudOndaNm(nivel, destino));
      setLineas((prev) => (prev.includes(nm) ? prev : [...prev, nm]));
      if (destino === 2 && nivel <= 6) {
        setBalmerVistas((prev) => {
          if (prev.includes(nivel)) return prev;
          if (sonido) audioRef.current?.correcto();
          return [...prev, nivel];
        });
      } else if (sonido) audioRef.current?.blip();
    } else if (sonido) audioRef.current?.blip();
  };

  // ── Objetivos guiados (se marcan en vivo; useLogros del shell los recuerda) ──
  const objetivos = [
    { txt: "Lámina de oro: dispara 2 000 partículas alfa y cuenta cuántas rebotan", done: statsR.disparadas >= 2000, modo: "rutherford" },
    { txt: "Bohr: baja el electrón de n = 3 a n = 2 y encuentra la línea roja de 656 nm", done: balmerVistas.includes(3), modo: "bohr" },
    { txt: "En «Construir átomo», arrastra tu primer protón al núcleo", done: logros.has("primer-proton"), modo: "construir" },
    { txt: "Equilibra la balanza: tantos electrones como protones (átomo neutro)", done: logros.has("neutro"), modo: "construir" },
    { txt: "Recorre los 5 modelos atómicos", done: visitados.size === MODELOS.length },
    { txt: "Observa el núcleo (de Rutherford en adelante)", done: ["rutherford", "bohr", "schrodinger"].includes(modeloKey) },
    { txt: "Identifica las capas de energía (Bohr)", done: modeloKey === "bohr" },
    { txt: "Llega al modelo cuántico (Schrödinger)", done: modeloKey === "schrodinger" },
    { txt: "Resuelve el reto de estructura atómica", done: ejercicioAprobado },
  ];

  const muestraNucleo = enConstruccion;

  // ── Cifras derivadas de cada experimento ───────────────────────────
  const dFm = distanciaMinimaFm(kMeV, metal.Z);
  const pRebote = probMayorQue(Math.PI / 2, dFm, metal, grosorUm);
  const unoDeCada = statsR.rebotes > 0 ? Math.round(statsR.disparadas / statsR.rebotes) : 0;
  const teoria = fraccionesTeoricas(dFm, metal, grosorUm);
  const nmUltimo = transicion ? longitudOndaNm(transicion.de, transicion.a) : 0;
  const orbNL = orbital === "atomo" ? null : NL_ORB[orbital]!;
  const r90pm = orbital === "atomo"
    ? Math.max(...configuracion(elemento.z).map((o) => radio90(o.orb.n, o.orb.l, o.zEf))) * A0_PM
    : radio90(orbNL!.n, orbNL!.l, 1) * A0_PM;

  const vistaEscena: VistaEscena = modo;

  const lectura =
    modo === "construir"
      ? bp === 0
        ? <>Arrastra protones al núcleo para dar identidad al átomo</>
        : <>{elementoConstruido ? elementoConstruido.nombre : `Z = ${bp}`}: {carga === 0 ? "neutro" : carga > 0 ? `catión +${carga}` : `anión ${carga}`}, A = {numMasaConstruido}</>
      : modo === "rutherford"
        ? <>{fmt(statsR.disparadas)} alfas disparadas · {fmt(statsR.rebotes)} rebotaron</>
        : modo === "bohr"
          ? bohrCapas
            ? <>Capas de {elemento.nombre}: {elemento.shells.join("-")}</>
            : transicion
              ? <>Salto {transicion.de} → {transicion.a}: fotón de {Math.round(nmUltimo)} nm</>
              : <>Electrón en n = {nivel}: E = {fmt(energiaBohr(nivel), 2)} eV</>
          : modo === "schrodinger"
            ? orbital === "atomo"
              ? <>Nube de {elemento.nombre}: {textoConfiguracion(elemento.z)}</>
              : <>Orbital {nombreVistaOrbital(orbital)}: {fases ? "azul ψ > 0, naranja ψ < 0" : "más puntos, más probable"}</>
            : <>{modelo.label} ({modelo.year}) con {elemento.nombre}: Z = {elemento.z}</>;

  // Fallback 2D cuando no hay WebGL
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: modelo.col, boxShadow: `0 10px 30px -6px ${modelo.col}` }}>
        <i className={`fa-solid ${modelo.icon}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>
        Modelo de {modelo.label} <span style={{ color: T.text3, fontWeight: 700 }}>({modelo.year})</span>
      </div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 340, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue: {modelo.desc} Elemento:{" "}
        <strong style={{ color: T.text }}>{elemento.nombre}</strong> (Z = {protones}).
      </div>
    </div>
  );

  /* ── Bloques reutilizables del panel ──────────────────────────────── */
  const bloqueElemento = (
    <Bloque titulo="Elemento" icono="fa-table-cells">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 6 }}>
        {ELEMENTOS.map((e) => (
          <button
            key={e.sym}
            className="ex-elem"
            data-on={e.sym === elementoSym}
            onClick={() => setElementoSym(e.sym)}
            title={`${e.nombre} (Z=${e.z})`}
            style={e.sym === elementoSym ? { borderColor: accent, background: `rgba(${color.rgba},0.16)`, boxShadow: `0 0 16px -5px rgba(${color.rgba},0.7)` } : undefined}
          >
            <span style={{ fontSize: 14, color: T.text3, ...NUM, lineHeight: 1 }}>{e.z}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: e.sym === elementoSym ? "#fff" : T.text2, lineHeight: 1.05 }}>{e.sym}</span>
          </button>
        ))}
      </div>
    </Bloque>
  );

  const bloqueModelo = (
    <Bloque titulo="Modelo actual" icono="fa-timeline">
      <div style={{ borderRadius: 14, border: `1px solid ${modelo.col}55`, background: `${modelo.col}14`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", background: modelo.col, boxShadow: `0 8px 22px -6px ${modelo.col}` }}>
          <i className={`fa-solid ${modelo.icon}`} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>
            {modelo.label} <span style={{ fontSize: 14, fontWeight: 700, color: T.text3, ...NUM }}>· {modelo.year}</span>
          </div>
          <div style={{ fontSize: 14, color: T.text2, marginTop: 3 }}>{modelo.desc}</div>
        </div>
      </div>
      <AporteLimite modelo={modelo} />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="ex-step" onClick={() => paso(-1)} disabled={idxModelo === 0}>
          <i className="fa-solid fa-arrow-left" /> Anterior
        </button>
        <button className="ex-step" onClick={() => paso(1)} disabled={idxModelo === MODELOS.length - 1}>
          Siguiente <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </Bloque>
  );

  const bloqueComposicion = (
    <Bloque titulo="Composición del átomo" icono="fa-gauge-high">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
        <Dato label="Protones" value={fmt(protones)} col={PROTON_COLOR} />
        <Dato label="Neutrones" value={fmt(neutrones)} col={NEUTRON_COLOR} />
        <Dato label="Electrones" value={fmt(electrones)} col={ELECTRON_COLOR} />
        <Dato label="Masa atómica" value={`${fmt(elemento.masa, 2)} u`} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 800, color: T.text3 }}>
        <span>ELECTRONES POR CAPA</span>
        <span style={{ fontWeight: 600 }}>{shells.length} {shells.length === 1 ? "capa" : "capas"}</span>
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {shells.map((c, i) => (
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
              fontSize: 14,
              fontWeight: 700,
              color: T.text,
              ...NUM,
            }}
          >
            <span style={{ fontSize: 14, color: T.text3 }}>n{i + 1}</span> {c} e⁻
          </span>
        ))}
      </div>
    </Bloque>
  );

  const bloqueConstructor = (
    <Bloque titulo="Tu átomo" icono="fa-atom">
      {/* Identidad del átomo construido */}
      <div
        style={{
          borderRadius: 14,
          border: `1px solid ${bp > 0 ? accent + "66" : T.line}`,
          background: bp > 0 ? `rgba(${color.rgba},0.10)` : T.inset,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            flexShrink: 0,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: bp > 0 ? accent : T.glass,
            color: bp > 0 ? "#06121f" : T.text3,
            boxShadow: bp > 0 ? `0 8px 22px -8px ${accent}` : "none",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{elementoConstruido?.sym ?? "?"}</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: T.text, lineHeight: 1.15 }}>
            {bp === 0 ? "Sin protones aún" : elementoConstruido ? elementoConstruido.nombre : `Z = ${bp} (fuera de la tabla)`}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                ...NUM,
                padding: "3px 9px",
                borderRadius: 999,
                color: carga === 0 ? "#34D399" : carga > 0 ? "#F87171" : "#60A5FA",
                background: carga === 0 ? "#34D39922" : carga > 0 ? "#F8717122" : "#60A5FA22",
              }}
            >
              {bp === 0 ? "—" : carga === 0 ? "neutro" : carga > 0 ? `catión +${carga}` : `anión ${carga}`}
            </span>
            {bp > 0 && (
              <span style={{ fontSize: 14, fontWeight: 800, ...NUM, padding: "3px 9px", borderRadius: 999, color: T.text2, background: T.glass }}>
                A = {numMasaConstruido}
              </span>
            )}
            {esIsotopo && (
              <span style={{ fontSize: 14, fontWeight: 800, ...NUM, padding: "3px 9px", borderRadius: 999, color: "#FBBF24", background: "#FBBF2422" }}>
                isótopo
              </span>
            )}
          </div>
        </div>
      </div>

      <BalanzaCarga p={bp} e={be} />

      {/* Bandeja de partículas: arrastra al visor o usa +/− */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PARTICULAS.map((pt) => {
          const c = conteo(pt.tipo);
          const max = pt.tipo === "p" ? MAX_P : pt.tipo === "n" ? MAX_N : MAX_E;
          return (
            <div
              key={pt.tipo}
              className="ma-chip"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/particula", pt.tipo);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => agregar(pt.tipo)}
              title={`Arrastra al visor o pulsa para añadir ${pt.label.toLowerCase()}`}
            >
              <span className="ma-orb" style={{ background: pt.color, boxShadow: `0 0 12px -2px ${pt.color}` }}>
                {pt.carga}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.15 }}>{pt.label}</div>
                <div style={{ fontSize: 14, color: T.text3 }}>{pt.desc}</div>
              </div>
              <button
                className="ma-pm"
                disabled={c === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  quitar(pt.tipo);
                }}
                title="Quitar"
                aria-label={`Quitar ${pt.label.toLowerCase()}`}
              >
                <i className="fa-solid fa-minus" />
              </button>
              <span style={{ minWidth: 26, textAlign: "center", fontSize: 16, fontWeight: 900, color: T.text, ...NUM }}>{c}</span>
              <button
                className="ma-pm"
                disabled={c >= max}
                onClick={(e) => {
                  e.stopPropagation();
                  agregar(pt.tipo);
                }}
                title="Añadir"
                aria-label={`Añadir ${pt.label.toLowerCase()}`}
              >
                <i className="fa-solid fa-plus" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={vaciar}
        disabled={bp + bn + be === 0}
        style={{
          cursor: bp + bn + be === 0 ? "not-allowed" : "pointer",
          opacity: bp + bn + be === 0 ? 0.35 : 1,
          fontSize: 14,
          fontWeight: 700,
          color: T.text2,
          background: "transparent",
          border: `1px solid ${T.line}`,
          borderRadius: 10,
          padding: "9px 12px",
        }}
      >
        <i className="fa-solid fa-trash-can" style={{ marginRight: 6 }} />
        Vaciar
      </button>

      <div style={{ display: "grid", gap: 8 }}>
        {retosConstructor.map((r) => {
          const done = logros.has(r.id);
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 14, opacity: done ? 1 : 0.3 }} />
              <span style={{ fontWeight: done ? 700 : 500 }}>{r.txt}</span>
            </div>
          );
        })}
      </div>
    </Bloque>
  );

  const porQueRutherford =
    statsR.disparadas === 0
      ? <>Pulsa <strong>Disparar</strong>: cada destello en la pantalla es una partícula alfa que llegó ahí.</>
      : statsR.rebotes === 0
        ? <>Casi todas pasan derecho: el átomo es <strong>casi todo vacío</strong>. Ninguna ha rebotado todavía; son rarísimas. Sube el ritmo y espera.</>
        : <>Rebotó <strong>1 de cada {fmt(unoDeCada)}</strong>. Con el «budín» de Thomson ninguna rebotaría: solo un <strong>núcleo diminuto, denso y positivo</strong> puede regresar una alfa.</>;

  const bloqueRutherford = (
    <>
      <Bloque titulo="Escala" icono="fa-magnifying-glass">
        <div className="ma-seg">
          {([["Aparato", "fa-flask"], ["Lámina", "fa-border-all"], ["Núcleo", "fa-circle-dot"]] as const).map(([lbl, ic], i) => (
            <button key={lbl} className="ma-op" data-on={etapa === i} onClick={() => setEtapa(i as 0 | 1 | 2)}>
              <i className={`fa-solid ${ic}`} /> {lbl}
            </button>
          ))}
        </div>
        <p className="ma-nota">
          {etapa === 0 && <>Una fuente lanza partículas alfa (He²⁺) contra una lámina de {metal.nombre.toLowerCase()}; la pantalla de sulfuro de zinc destella donde llegan.</>}
          {etapa === 1 && <>Dentro de la lámina, los átomos están uno junto a otro, pero son <strong>casi todo vacío</strong>: las alfas los atraviesan.</>}
          {etapa === 2 && <>Junto al núcleo, la repulsión eléctrica curva cada alfa en una <strong>hipérbola</strong>. Cuanto más cerca pasa (b pequeño), más se desvía.</>}
        </p>
      </Bloque>
      <Bloque titulo="Disparo" icono="fa-burst">
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ex-step" onClick={() => setDisparando((v) => !v)} style={disparando ? undefined : { color: "#04121f", background: accent, borderColor: accent }}>
            <i className={`fa-solid ${disparando ? "fa-pause" : "fa-play"}`} /> {disparando ? "Pausar" : "Disparar"}
          </button>
          <button className="ex-step" onClick={() => setLimpiarNonce((n) => n + 1)}>
            <i className="fa-solid fa-eraser" /> Limpiar
          </button>
        </div>
        <Deslizador label="Ritmo de disparo" icon="fa-gauge-high" colr="#ffd27a" valor={`${fmt(ritmo)} por s`} min={1} max={4.3} step={0.05} value={logRitmo} onChange={setLogRitmo} hintL="lento: se ve cada una" hintR="rápido: estadística" />
      </Bloque>
      <Bloque titulo="Resultados" icono="fa-chart-column">
        <div className="ma-cifras">
          <Dato label="Disparadas" value={fmt(statsR.disparadas)} />
          <Dato label="Casi rectas (< 10°)" value={statsR.disparadas ? `${fmt((statsR.rectas / statsR.disparadas) * 100, 2)} %` : "—"} col="#9fd8ff" />
          <Dato label="Desviadas (10°–90°)" value={fmt(statsR.desviadas)} col="#ffb347" />
          <Dato label="Rebotan (> 90°)" value={fmt(statsR.rebotes)} col="#ff6b5a" />
        </div>
        <Histograma hist={statsR.hist} teoria={teoria} total={statsR.disparadas} />
        <p className="ma-nota">{porQueRutherford}</p>
      </Bloque>
      <Bloque titulo="Cambia el experimento" icono="fa-sliders">
        <div className="ma-seg">
          {METALES.map((m) => (
            <button key={m.id} className="ma-op" data-on={m.id === metalId} onClick={() => setMetalId(m.id)}>
              {m.nombre} <span style={{ opacity: 0.75, ...NUM }}>Z={m.Z}</span>
            </button>
          ))}
        </div>
        <Deslizador label="Energía de las alfas" icon="fa-bolt" colr="#ffb347" valor={`${fmt(kMeV, 1)} MeV`} min={4} max={9} step={0.1} value={kMeV} onChange={setKMeV} hintL="lentas" hintR="rápidas" />
        <Deslizador label="Grosor de la lámina" icon="fa-layer-group" colr="#e7b54c" valor={`${fmt(grosorUm, 1)} µm`} min={0.2} max={4} step={0.1} value={grosorUm} onChange={setGrosorUm} hintL="delgada" hintR="gruesa" />
        <div className="ma-cifras">
          <Dato label="Distancia mínima d" value={`${fmt(dFm, 1)} fm`} />
          <Dato label="Predicción: rebota 1 de cada" value={pRebote > 0 ? fmt(Math.round(1 / pRebote)) : "—"} col="#ff6b5a" />
        </div>
        <p className="ma-nota">
          La fracción que rebota crece con <strong>Z²</strong> del metal y baja con <strong>K²</strong> (la energía): prueba plata o aluminio, o alfas más rápidas.
        </p>
      </Bloque>
    </>
  );

  const ultimaRegion = transicion ? regionEspectral(nmUltimo) : "visible";
  const porQueBohr = !transicion ? (
    <>Elige un nivel. Al <strong>bajar</strong>, el electrón suelta su energía sobrante como un fotón; al <strong>subir</strong>, necesita absorber uno.</>
  ) : (
    <>
      {transicion.a < transicion.de ? "Bajó" : "Subió"} de n = {transicion.de} a n = {transicion.a}:{" "}
      {transicion.a < transicion.de ? "perdió" : "ganó"} <strong>{fmt(energiaFoton(transicion.de, transicion.a), 2)} eV</strong>, justo la energía de un fotón de{" "}
      <strong style={{ color: colorDeLongitud(nmUltimo) }}>{fmt(Math.round(nmUltimo))} nm</strong>
      {ultimaRegion === "visible" ? ` (luz visible, serie de ${serieEspectral(Math.min(transicion.de, transicion.a))})` : ` (${ultimaRegion}: no se ve; serie de ${serieEspectral(Math.min(transicion.de, transicion.a))})`}.
    </>
  );

  const bloqueBohr = (
    <>
      <Bloque titulo="Salta de nivel" icono="fa-stairs">
        <div className="ma-seg" style={{ gridTemplateColumns: "repeat(6, minmax(0,1fr))" }}>
          {Array.from({ length: N_MAX_BOHR }, (_, i) => i + 1).map((n) => (
            <button key={n} className="ma-op" data-on={n === nivel} onClick={() => saltar(n)} disabled={bohrCapas} style={{ padding: "10px 4px" }}>
              n={n}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ex-step" onClick={() => saltar(nivel - 1)} disabled={bohrCapas || nivel === 1}>
            <i className="fa-solid fa-arrow-down" /> Bajar (emite)
          </button>
          <button className="ex-step" onClick={() => saltar(nivel + 1)} disabled={bohrCapas || nivel === N_MAX_BOHR}>
            <i className="fa-solid fa-arrow-up" /> Subir (absorbe)
          </button>
        </div>
        <p className="ma-nota">{porQueBohr}</p>
      </Bloque>
      <Bloque titulo="Espectro del hidrógeno" icono="fa-rainbow">
        <EspectroTira lineas={lineas} grande />
        <p className="ma-nota">
          Líneas de Balmer encontradas: <strong>{balmerVistas.length} de 4</strong> ({LINEAS_BALMER.map((l) => `${l.n}→2: ${l.nm} nm`).join(" · ")}).
          Cada elemento tiene sus propias líneas: es su «huella digital».
        </p>
        {lineas.some((nm) => nm < NM_MIN || nm > NM_MAX) && (
          <p className="ma-nota">
            Fuera de lo visible: {lineas.filter((nm) => nm < NM_MIN || nm > NM_MAX).sort((a, b) => a - b).map((nm) => `${fmt(nm)} nm (${regionEspectral(nm)})`).join(", ")}.
          </p>
        )}
      </Bloque>
      <Bloque titulo="Niveles de energía" icono="fa-chart-simple">
        <EscaleraEnergia nivel={nivel} ultima={transicion} />
        <div className="ma-cifras">
          <Dato label="Energía E_n" value={`${fmt(energiaBohr(nivel), 2)} eV`} col="#5BC8FF" />
          <Dato label="Radio r_n = n²·a₀" value={`${fmt(radioBohrPm(nivel), 0)} pm`} />
        </div>
      </Bloque>
      <Bloque titulo="Otros elementos" icono="fa-atom">
        <label className="ma-check">
          <input type="checkbox" checked={bohrCapas} onChange={(e) => setBohrCapas(e.target.checked)} />
          Ver las capas de {elemento.nombre} ({elemento.shells.join("-")})
        </label>
        {bohrCapas && (
          <p className="ma-nota">
            Bohr acomoda los electrones en capas, pero su modelo <strong>solo predice bien el espectro del hidrógeno</strong>; con más electrones falla.
          </p>
        )}
      </Bloque>
      {bohrCapas && bloqueElemento}
    </>
  );

  const bloqueSchrodinger = (
    <>
      <Bloque titulo="Orbital" icono="fa-cloud">
        {ORBITALES_UI.map((g) => (
          <div key={g.grupo} style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text3 }}>{g.grupo}</span>
            <div className="ma-orbs">
              {g.ops.map((o) => (
                <button key={o.id} className="ma-op" data-on={orbital === o.id} onClick={() => setOrbital(o.id)} style={{ padding: "9px 4px" }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className="ma-op" data-on={orbital === "atomo"} onClick={() => setOrbital("atomo")}>
          <i className="fa-solid fa-atom" /> Nube de {elemento.nombre} (todos sus electrones)
        </button>
      </Bloque>
      <Bloque titulo="Explora la nube" icono="fa-hand">
        <Deslizador label="Separar lóbulos" icon="fa-up-right-and-down-left-from-center" colr="#34D399" valor={`${fmt(separar * 100)} %`} min={0} max={1} step={0.05} value={separar} onChange={setSeparar} hintL="juntos" hintR="separados" />
        {orbital !== "atomo" && (
          <>
            <label className="ma-check">
              <input type="checkbox" checked={fases} onChange={(e) => setFases(e.target.checked)} />
              Colorear la fase (signo de ψ)
            </label>
            <label className="ma-check">
              <input type="checkbox" checked={nodos} onChange={(e) => setNodos(e.target.checked)} />
              Mostrar superficies nodales (ψ = 0)
            </label>
          </>
        )}
        <div className="ma-cifras">
          {orbNL ? (
            <>
              <Dato label="Números n, l" value={`${orbNL.n}, ${orbNL.l} (${["s", "p", "d"][orbNL.l]})`} />
              <Dato label="Nodos angulares" value={`${orbNL.l}`} />
              <Dato label="Nodos radiales" value={`${orbNL.n - orbNL.l - 1}`} />
              <Dato label="90 % dentro de" value={`${fmt(r90pm)} pm`} col="#34D399" />
            </>
          ) : (
            <>
              <Dato label="Configuración" value={textoConfiguracion(elemento.z)} />
              <Dato label="90 % dentro de" value={`${fmt(r90pm)} pm`} col="#34D399" />
            </>
          )}
        </div>
        <p className="ma-nota">
          {orbital === "atomo" ? (
            <>Cada color es un subnivel: <strong style={{ color: "#38bdf8" }}>s</strong> esféricos y <strong style={{ color: "#fb923c" }}>p</strong> en lóbulos. Los electrones internos quedan apretados junto al núcleo; los de valencia forman la nube grande.</>
          ) : (
            <>Cada punto es un lugar donde <strong>podría</strong> estar el electrón. No hay trayectoria: solo probabilidad, más alta donde los puntos se juntan.</>
          )}
        </p>
      </Bloque>
      {orbital === "atomo" && bloqueElemento}
    </>
  );

  /* ── Leyenda sobre la escena, según el modo ───────────────────────── */
  const leyenda =
    modo === "construir" ? (
      <div style={{ width: 190, display: "grid", gap: 6 }}>
        <BalanzaCarga p={protones} e={electrones} compacto />
        {muestraNucleo && (
          <div style={{ display: "grid", gap: 2 }}>
            <LegendDot color={PROTON_COLOR} label="Protón" />
            <LegendDot color={NEUTRON_COLOR} label="Neutrón" />
            <LegendDot color={ELECTRON_COLOR} label="Electrón" />
          </div>
        )}
      </div>
    ) : modo === "rutherford" ? (
      <div style={{ display: "grid", gap: 3, minWidth: 168 }}>
        <LegendDot color="#9fd8ff" label={`Rectas: ${fmt(statsR.rectas)}`} />
        <LegendDot color="#ffb347" label={`Desviadas: ${fmt(statsR.desviadas)}`} />
        <LegendDot color="#ff6b5a" label={`Rebotan: ${fmt(statsR.rebotes)}`} />
      </div>
    ) : modo === "bohr" && !bohrCapas ? (
      <div style={{ width: 230, display: "grid", gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".08em", color: T.text3 }}>ESPECTRO DE EMISIÓN</span>
        <EspectroTira lineas={lineas} />
      </div>
    ) : modo === "schrodinger" && orbital !== "atomo" && fases ? (
      <div style={{ display: "grid", gap: 3 }}>
        <LegendDot color="#4fb8ff" label="Fase ψ > 0" />
        <LegendDot color="#ff8a3d" label="Fase ψ < 0" />
      </div>
    ) : modo === "thomson" ? (
      <div style={{ display: "grid", gap: 3 }}>
        <LegendDot color="#ff8a5c" label="Carga positiva" />
        <LegendDot color={ELECTRON_COLOR} label="Electrón" />
      </div>
    ) : undefined;

  const contenidoControles =
    modo === "construir" ? (
      <>
        {bloqueConstructor}
        {bloqueComposicion}
      </>
    ) : modo === "rutherford" ? (
      <>
        {bloqueRutherford}
        {bloqueModelo}
      </>
    ) : modo === "bohr" ? (
      <>
        {bloqueBohr}
        {bloqueModelo}
      </>
    ) : modo === "schrodinger" ? (
      <>
        {bloqueSchrodinger}
        {bloqueModelo}
      </>
    ) : (
      <>
        {bloqueModelo}
        {bloqueElemento}
        {bloqueComposicion}
      </>
    );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <div
          onDragOver={
            enConstruccion
              ? (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                  if (!dragOver) setDragOver(true);
                }
              : undefined
          }
          onDragLeave={enConstruccion ? () => setDragOver(false) : undefined}
          onDrop={
            enConstruccion
              ? (e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const tipo = e.dataTransfer.getData("text/particula") as Particula;
                  if (tipo === "p" || tipo === "n" || tipo === "e") agregar(tipo);
                }
              : undefined
          }
          style={{ position: "absolute", inset: 0 }}
        >
          <style>{CSS_MA + CSS_VIAJE + "@keyframes maLinea { from { opacity:0; transform:scaleY(0.2); } to { opacity:1; transform:scaleY(1); } }"}</style>
          <SceneBoundary fallback={sceneFallback}>
            <ModelosAtomicosScene
              vista={vistaEscena}
              protones={protones}
              neutrones={neutrones}
              electrones={electrones}
              shells={shells}
              elementColor={enConstruccion ? elementoConstruido?.color ?? "#cfe6ff" : elemento.color}
              accent={accent}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
              etapa={etapa}
              metal={metal}
              kMeV={kMeV}
              grosorUm={grosorUm}
              disparando={disparando}
              ritmo={ritmo}
              limpiarNonce={limpiarNonce}
              onStats={setStatsR}
              nivel={nivel}
              transicion={transicion}
              bohrCapas={bohrCapas}
              orbital={orbital}
              zOrbital={elemento.z}
              separar={separar}
              fases={fases}
              nodos={nodos}
            />
          </SceneBoundary>

          {/* Realce visual + pista al arrastrar (no captura punteros: deja girar el átomo) */}
          {enConstruccion && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                borderRadius: 20,
                border: dragOver ? `2px dashed ${accent}` : "2px dashed transparent",
                background: dragOver ? `rgba(${color.rgba},0.10)` : "transparent",
                transition: "all .15s ease",
              }}
            >
              {bp + bn + be === 0 && (
                <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", color: "rgba(255,255,255,0.7)", padding: "0 16px" }}>
                  <i className="fa-solid fa-hand-pointer" style={{ fontSize: 30, marginBottom: 12, color: accent }} />
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Arrastra partículas aquí</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>protones y neutrones forman el núcleo; los electrones, las capas</div>
                </div>
              )}
            </div>
          )}
        </div>
      }
      modos={{
        opciones: [
          ...MODELOS.map((m) => ({ id: m.key, etiqueta: m.key === "schrodinger" ? "Cuántico" : m.label, icono: m.icon })),
          { id: "construir", etiqueta: "Construir átomo", icono: "fa-hand-pointer" },
        ],
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "rutherford" ? (
            <>
              <BotonHerramienta icono={disparando ? "fa-pause" : "fa-play"} titulo={disparando ? "Pausar el disparo" : "Disparar partículas alfa"} activo={disparando} onClick={() => setDisparando((v) => !v)} />
              <BotonHerramienta icono="fa-magnifying-glass-minus" titulo="Alejar (escala mayor)" onClick={() => setEtapa((e) => (e > 0 ? ((e - 1) as 0 | 1 | 2) : e))} />
              <BotonHerramienta icono="fa-magnifying-glass-plus" titulo="Acercar (hacia el núcleo)" onClick={() => setEtapa((e) => (e < 2 ? ((e + 1) as 0 | 1 | 2) : e))} />
            </>
          ) : modo === "bohr" && !bohrCapas ? (
            <>
              <BotonHerramienta icono="fa-arrow-down" titulo="Bajar un nivel (emite luz)" onClick={() => saltar(nivel - 1)} />
              <BotonHerramienta icono="fa-arrow-up" titulo="Subir un nivel (absorbe luz)" onClick={() => saltar(nivel + 1)} />
            </>
          ) : (
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          )}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar partículas" onClick={() => setResetNonce((n) => n + 1)} />
        </>
      }
      leyenda={leyenda}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: contenidoControles,
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ_A2}
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              mensajeAprobado="¡Aprobado! Dominas la estructura del átomo."
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              playPick={sonido ? () => audioRef.current?.blip() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Línea del tiempo de los modelos" icono="fa-timeline">
                <Timeline activo={modeloKey} onPick={irAModelo} />
              </Bloque>
              <Bloque titulo="Aporte y límite del modelo" icono="fa-scale-balanced">
                <AporteLimite modelo={modelo} />
              </Bloque>
              <Bloque titulo="Idea clave" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Cada modelo no «borra» al anterior: lo <strong style={{ color: "#fff" }}>corrige y amplía</strong>. La ciencia avanza así,
                  con evidencia nueva. Cambia de elemento y observa cómo crece el <strong style={{ color: "#fff" }}>núcleo</strong> y se llenan
                  las <strong style={{ color: "#fff" }}>capas</strong>.
                </p>
              </Bloque>
              <Bloque titulo="La evidencia que cambió cada modelo" icono="fa-microscope">
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Lámina de oro (1909–1911).</strong> Geiger y Marsden, bajo la dirección de Rutherford, dispararon
                  partículas alfa contra una hoja de oro muy delgada. Casi todas la atravesaron, pero unas pocas rebotaron. Con el modelo de
                  Thomson eso era imposible; Rutherford concluyó que la carga positiva y casi toda la masa están en un núcleo diminuto. El ángulo
                  de cada alfa sigue la ley de Coulomb: θ = 2·arctan(d / 2b), con b la distancia a la que pasa del núcleo.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Espectro del hidrógeno (1913).</strong> Bohr propuso órbitas permitidas con energía
                  Eₙ = −13,6 eV / n² y radio rₙ = n²·a₀. Al saltar de un nivel a otro, el electrón emite o absorbe un fotón con
                  E = hc / λ. Las cuatro líneas visibles de Balmer (656, 486, 434 y 410 nm) salen de saltos que terminan en n = 2.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: "#fff" }}>Ecuación de Schrödinger (1926).</strong> El electrón se describe con una función de onda ψ;
                  |ψ|² da la probabilidad de hallarlo en cada punto. Los orbitales s son esféricos, los p tienen dos lóbulos y los d, cuatro
                  (o un lóbulo doble con anillo, el d_z²). Donde ψ cambia de signo hay una superficie nodal: ahí nunca está el electrón.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={MODELOS_ATOMICOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}


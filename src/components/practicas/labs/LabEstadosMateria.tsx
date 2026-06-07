"use client";

/**
 * Laboratorio 3D — Estados de la materia (teoría cinética).
 * Práctica experimental para CNEYT-I-P05 (estados de agregación y sus cambios).
 *
 * El estudiante elige una sustancia y mueve la temperatura; observa en 3D cómo
 * las partículas pasan de la red cristalina (sólido) → movimiento cohesionado
 * (líquido) → libertad total (gas), según la energía cinética media. Los puntos
 * de fusión y ebullición de cada sustancia delimitan las tres zonas.
 *
 * Diseño: tema oscuro "instrumento de laboratorio" coherente con PracticaRunner.
 * La física se hace VISIBLE con:
 *   · Termómetro de fases (fusión/ebullición marcados, aguja en T actual).
 *   · Lectura EN VIVO del estado + energía cinética relativa.
 *   · Partículas que vibran/fluyen/vuelan según el estado.
 * Si el dispositivo no soporta WebGL, un fallback 2D sigue demostrando la física.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import type { Fase } from "./EstadosMateriaScene";
import { T, NUM, card, Eyebrow, Readout, SceneBoundary } from "./_kit";

const EstadosMateriaScene = dynamic(() => import("./EstadosMateriaScene"), {
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
      <i className="fa-solid fa-temperature-half fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

// Colores de estado (frío → caliente)
const C_SOLIDO = "#60A5FA";
const C_LIQUIDO = "#22D3EE";
const C_GAS = "#FB923C";

/* ── Datos físicos: puntos de fusión y ebullición (°C) ────────────────── */
interface Sustancia {
  key: string;
  label: string;
  fusion: number; // °C
  ebullicion: number; // °C
  color: string;
  tipo: string; // descriptor corto (molécula / gas / metal)
  metal: boolean;
  metalness: number;
  roughness: number;
  pScale: number; // tamaño relativo de partícula
  cohesion: number; // 0..1 cohesión del líquido
}
// Colores y propiedades de material elegidos para que CADA sustancia se vea
// distinta: agua azul, etanol violeta, gases tenues diferenciados, metales con
// acabado metálico (plata el mercurio, acero el hierro) que se vuelven
// incandescentes al calentarse.
const SUSTANCIAS: Sustancia[] = [
  { key: "agua", label: "Agua", fusion: 0, ebullicion: 100, color: "#3FA9F5", tipo: "molécula", metal: false, metalness: 0, roughness: 0.12, pScale: 1.0, cohesion: 0.35 },
  { key: "etanol", label: "Etanol", fusion: -114, ebullicion: 78, color: "#b07bff", tipo: "alcohol", metal: false, metalness: 0, roughness: 0.18, pScale: 0.95, cohesion: 0.2 },
  { key: "oxigeno", label: "Oxígeno", fusion: -218, ebullicion: -183, color: "#5fa8ff", tipo: "gas", metal: false, metalness: 0, roughness: 0.25, pScale: 0.78, cohesion: 0.1 },
  { key: "nitrogeno", label: "Nitrógeno", fusion: -210, ebullicion: -196, color: "#cfe0ff", tipo: "gas", metal: false, metalness: 0, roughness: 0.3, pScale: 0.74, cohesion: 0.1 },
  { key: "mercurio", label: "Mercurio", fusion: -39, ebullicion: 357, color: "#d6dde4", tipo: "metal", metal: true, metalness: 0.95, roughness: 0.16, pScale: 1.18, cohesion: 0.9 },
  { key: "hierro", label: "Hierro", fusion: 1538, ebullicion: 2861, color: "#9aa1aa", tipo: "metal", metal: true, metalness: 0.9, roughness: 0.34, pScale: 1.28, cohesion: 0.7 },
];

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

function faseDe(temp: number, s: Sustancia): Fase {
  if (temp <= s.fusion) return "solido";
  if (temp >= s.ebullicion) return "gas";
  return "liquido";
}

const FASE_INFO: Record<Fase, { txt: string; sub: string; icon: string; col: string }> = {
  solido: { txt: "Sólido", sub: "Partículas vibrando en una red rígida", icon: "fa-cube", col: C_SOLIDO },
  liquido: { txt: "Líquido", sub: "Partículas juntas pero que fluyen", icon: "fa-droplet", col: C_LIQUIDO },
  gas: { txt: "Gas", sub: "Partículas libres que llenan el espacio", icon: "fa-wind", col: C_GAS },
};

/* ── Componentes de UI (declarados fuera del render: estado estable) ──── */

// Tile seleccionable (sustancia)
const Tile = ({
  active,
  swatch,
  label,
  sub,
  onClick,
  accent,
  colorRgba,
}: {
  active: boolean;
  swatch: string;
  label: string;
  sub: string;
  onClick: () => void;
  accent: string;
  colorRgba: string;
}) => (
  <button
    onClick={onClick}
    className="ex-tile"
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
        borderRadius: "50%",
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

/* ── Termómetro de fases: el "porqué" del estado ──────────────────────── */
const PhaseThermometer = ({
  temp,
  min,
  max,
  fusion,
  ebullicion,
  faseCol,
}: {
  temp: number;
  min: number;
  max: number;
  fusion: number;
  ebullicion: number;
  faseCol: string;
}) => {
  const span = max - min || 1;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
  const pFus = pct(fusion);
  const pEbu = pct(ebullicion);
  const pT = pct(temp);

  return (
    <div>
      <Eyebrow>Termómetro de fases</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em" }}>
        <span style={{ color: C_SOLIDO }}>SÓLIDO</span>
        <span style={{ color: C_LIQUIDO }}>LÍQUIDO</span>
        <span style={{ color: C_GAS }}>GAS</span>
      </div>
      <div
        style={{
          position: "relative",
          height: 16,
          borderRadius: 999,
          overflow: "hidden",
          border: `1px solid ${T.line}`,
          background: `linear-gradient(90deg,
            ${C_SOLIDO}cc 0%, ${C_SOLIDO}cc ${pFus}%,
            ${C_LIQUIDO}cc ${pFus}%, ${C_LIQUIDO}cc ${pEbu}%,
            ${C_GAS}cc ${pEbu}%, ${C_GAS}cc 100%)`,
        }}
      >
        {/* marcas de fusión y ebullición */}
        <div style={{ position: "absolute", left: `${pFus}%`, top: -2, bottom: -2, width: 2, background: "rgba(255,255,255,0.7)", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", left: `${pEbu}%`, top: -2, bottom: -2, width: 2, background: "rgba(255,255,255,0.7)", transform: "translateX(-50%)" }} />
        {/* aguja de temperatura actual */}
        <div
          style={{
            position: "absolute",
            left: `${pT}%`,
            top: "50%",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: faseCol,
            border: "2px solid rgba(255,255,255,0.9)",
            boxShadow: `0 0 16px -1px ${faseCol}`,
            transform: "translate(-50%,-50%)",
            transition: "left 0.35s cubic-bezier(0.34,1.2,0.64,1), background 0.3s ease",
          }}
        />
      </div>
      {/* etiquetas de los puntos de cambio */}
      <div style={{ position: "relative", height: 30, marginTop: 6, fontSize: 11, ...NUM }}>
        <div style={{ position: "absolute", left: `${pFus}%`, transform: "translateX(-50%)", textAlign: "center", color: T.text2 }}>
          <i className="fa-solid fa-icicles" style={{ fontSize: 10, color: C_SOLIDO }} /> fusión<br />
          <strong style={{ color: T.text }}>{fmt(fusion)} °C</strong>
        </div>
        <div style={{ position: "absolute", left: `${pEbu}%`, transform: "translateX(-50%)", textAlign: "center", color: T.text2 }}>
          <i className="fa-solid fa-fire" style={{ fontSize: 10, color: C_GAS }} /> ebullición<br />
          <strong style={{ color: T.text }}>{fmt(ebullicion)} °C</strong>
        </div>
      </div>
    </div>
  );
};

/* ── Reparto de energía: cinética vs potencial ───────────────────────── */
const EnergyBreakdown = ({ agitacion, enCambio, faseCol }: { agitacion: number; enCambio: boolean; faseCol: string }) => {
  const cin = Math.round(agitacion * 100);
  return (
    <div>
      <Eyebrow>Energía de las partículas</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>Energía cinética media (relativa)</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text, ...NUM }}>{cin}%</span>
      </div>
      <div style={{ height: 14, borderRadius: 999, background: T.inset, overflow: "hidden", border: `1px solid ${T.line}` }}>
        <div
          style={{
            width: `${cin}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${faseCol}, ${faseCol}bb)`,
            boxShadow: `0 0 14px -2px ${faseCol}`,
            transition: "width 0.4s cubic-bezier(0.34,1.2,0.64,1)",
          }}
        />
      </div>
      <p style={{ margin: "11px 0 0", fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
        {enCambio ? (
          <>
            <i className="fa-solid fa-arrows-left-right-to-line" style={{ color: faseCol, marginRight: 7 }} />
            <strong style={{ color: T.text }}>Justo en el cambio de estado</strong>: el calor rompe las fuerzas entre partículas
            (energía potencial) y la temperatura se mantiene constante.
          </>
        ) : (
          <>
            <i className="fa-solid fa-temperature-arrow-up" style={{ color: faseCol, marginRight: 7 }} />
            A mayor temperatura, mayor <strong style={{ color: T.text }}>energía cinética</strong>: las partículas se mueven más rápido.
          </>
        )}
      </p>
    </div>
  );
};

export function LabEstadosMateria({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [sustanciaKey, setSustanciaKey] = useState("agua");
  const [temp, setTemp] = useState(25); // °C
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const sustancia = SUSTANCIAS.find((s) => s.key === sustanciaKey)!;

  // Rango del slider: se adapta a cada sustancia para que las dos transiciones
  // queden siempre alcanzables y bien separadas.
  const { min, max } = useMemo(() => {
    const spanReal = sustancia.ebullicion - sustancia.fusion;
    const margen = Math.max(spanReal * 0.45, 25);
    return { min: Math.round(sustancia.fusion - margen), max: Math.round(sustancia.ebullicion + margen) };
  }, [sustancia]);

  const fase = faseDe(temp, sustancia);
  const info = FASE_INFO[fase];

  // Energía cinética relativa = posición de la temperatura en el rango.
  const agitacion = Math.max(0, Math.min(1, (temp - min) / (max - min || 1)));
  // ¿Estamos prácticamente en un punto de cambio de estado?
  const spanRango = max - min || 1;
  const enCambio =
    Math.abs(temp - sustancia.fusion) < spanRango * 0.02 ||
    Math.abs(temp - sustancia.ebullicion) < spanRango * 0.02;

  const tempK = temp + 273.15;

  // Al cambiar de sustancia, recoloca la temperatura a un valor sensato (líquido
  // si existe ese rango; si no, al centro).
  const seleccionarSustancia = (s: Sustancia) => {
    setSustanciaKey(s.key);
    const medio = (s.fusion + s.ebullicion) / 2;
    setTemp(Math.round(medio));
  };

  // Saltos rápidos a cada estado
  const irA = (objetivo: Fase) => {
    const spanReal = sustancia.ebullicion - sustancia.fusion;
    if (objetivo === "solido") setTemp(Math.round(sustancia.fusion - spanReal * 0.3 - 5));
    else if (objetivo === "gas") setTemp(Math.round(sustancia.ebullicion + spanReal * 0.3 + 5));
    else setTemp(Math.round((sustancia.fusion + sustancia.ebullicion) / 2));
  };

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  const objetivos = [
    { txt: "Observa la red cristalina (sólido)", done: fase === "solido" },
    { txt: "Funde la sustancia (líquido)", done: fase === "liquido" },
    { txt: "Evapora la sustancia (gas)", done: fase === "gas" },
    { txt: "Lleva la energía cinética al máximo", done: agitacion > 0.92 },
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
          background: info.col,
          boxShadow: `0 10px 30px -6px ${info.col}`,
        }}
      >
        <i className={`fa-solid ${info.icon}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{info.txt}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 320, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue funcionando: revisa el termómetro de fases y la energía
        de las partículas más abajo. <strong style={{ color: T.text }}>{fmt(temp)} °C.</strong>
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px;
          background:${T.lineStrong}; outline:none; }
        .ex-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px;
          border-radius:50%; background:#fff; cursor:pointer; border:2px solid ${accent};
          box-shadow:0 1px 8px rgba(0,0,0,0.5); }
        .ex-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; cursor:pointer;
          border:2px solid ${accent}; box-shadow:0 1px 8px rgba(0,0,0,0.5); }
        .ex-tile:hover { border-color:${T.lineStrong} !important; background:${T.glassSoft} !important; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-seg { display:flex; gap:4px; padding:4px; border-radius:12px; background:${T.inset}; border:1px solid ${T.line}; }
        .ex-seg button { flex:1; cursor:pointer; border:none; background:transparent; border-radius:9px;
          padding:9px 10px; font-size:13.5px; font-weight:700; color:${T.text2}; display:flex; align-items:center;
          justify-content:center; gap:7px; transition:all .15s ease; }
        .ex-seg button[data-on="true"] { color:#fff; }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
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
              <EstadosMateriaScene
                fase={fase}
                agitacion={agitacion}
                particleColor={sustancia.color}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                metal={sustancia.metal}
                metalness={sustancia.metalness}
                roughness={sustancia.roughness}
                pScale={sustancia.pScale}
                cohesion={sustancia.cohesion}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO + estado */}
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
                border: `1px solid ${info.col}66`,
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                className="ex-live-dot"
                style={{ ["--exc" as string]: `${info.col}aa`, width: 9, height: 9, borderRadius: "50%", background: info.col }}
              />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <i className={`fa-solid ${info.icon}`} style={{ fontSize: 12, color: info.col }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.text }}>{info.txt}</span>
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
              <button className="ex-icobtn" onClick={() => setResetNonce((n) => n + 1)} title="Reordenar partículas">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Temperatura flotante grande */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                right: 16,
                textAlign: "right",
                pointerEvents: "none",
                background: "rgba(2,12,28,0.6)",
                padding: "6px 13px",
                borderRadius: 13,
                backdropFilter: "blur(6px)",
                border: `1px solid ${info.col}44`,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM, textShadow: `0 0 18px ${info.col}66` }}>
                {fmt(temp)} <span style={{ fontSize: 12, fontWeight: 700, color: T.text3 }}>°C</span>
              </div>
              <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, ...NUM }}>{fmt(tempK)} K</div>
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

          {/* Lectura del experimento: termómetro de fases + energía */}
          <div style={{ ...card, padding: "20px 22px" }}>
            <PhaseThermometer temp={temp} min={min} max={max} fusion={sustancia.fusion} ebullicion={sustancia.ebullicion} faseCol={info.col} />
            <div className="ex-divider" />
            <EnergyBreakdown agitacion={agitacion} enCambio={enCambio} faseCol={info.col} />
          </div>
        </div>

        {/* ── Columna controles (panel único) ────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Estado actual */}
          <Eyebrow>Estado actual</Eyebrow>
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${info.col}55`,
              background: `${info.col}14`,
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
                background: info.col,
                boxShadow: `0 8px 22px -6px ${info.col}`,
              }}
            >
              <i className={`fa-solid ${info.icon}`} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{info.txt}</div>
              <div style={{ fontSize: 12.5, color: T.text2, marginTop: 3 }}>{info.sub}</div>
            </div>
          </div>

          <div className="ex-divider" />

          {/* Sustancia */}
          <Eyebrow>Sustancia</Eyebrow>
          <div style={grid2}>
            {SUSTANCIAS.map((s) => (
              <Tile
                key={s.key}
                active={s.key === sustanciaKey}
                swatch={s.color}
                label={s.label}
                sub={`${s.tipo} · ${fmt(s.fusion)} / ${fmt(s.ebullicion)} °C`}
                onClick={() => seleccionarSustancia(s)}
                accent={accent}
                colorRgba={color.rgba}
              />
            ))}
          </div>

          <div className="ex-divider" />

          {/* Temperatura */}
          <Eyebrow>Temperatura</Eyebrow>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, color: T.text2, fontWeight: 700 }}>Calor aplicado</span>
              <span style={{ fontSize: 14, color: T.text, fontWeight: 800, ...NUM }}>{fmt(temp)} °C</span>
            </div>
            <input
              className="ex-slider"
              type="range"
              min={min}
              max={max}
              step={1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
              <span>{fmt(min)} °C</span>
              <span>{fmt(max)} °C</span>
            </div>
          </div>

          <div style={{ marginTop: 14 }} className="ex-seg">
            <button data-on={fase === "solido"} onClick={() => irA("solido")} style={fase === "solido" ? { background: `${C_SOLIDO}33` } : undefined}>
              <i className="fa-solid fa-cube" /> Sólido
            </button>
            <button data-on={fase === "liquido"} onClick={() => irA("liquido")} style={fase === "liquido" ? { background: `${C_LIQUIDO}33` } : undefined}>
              <i className="fa-solid fa-droplet" /> Líquido
            </button>
            <button data-on={fase === "gas"} onClick={() => irA("gas")} style={fase === "gas" ? { background: `${C_GAS}33` } : undefined}>
              <i className="fa-solid fa-wind" /> Gas
            </button>
          </div>

          <div className="ex-divider" />

          {/* Lecturas instrumento */}
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Temperatura" value={fmt(temp)} unit="°C" col={info.col} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="En kelvin" value={fmt(tempK)} unit="K" />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="E. cinética" value={`${Math.round(agitacion * 100)}`} unit="%" col={info.col} />
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? C_LIQUIDO : T.text2 }}>
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
            La materia cambia de estado porque cambia la <strong style={{ color: T.text }}>energía</strong> de sus partículas, no la
            sustancia. El <strong style={{ color: T.text }}>oxígeno</strong> es gas a temperatura ambiente; el{" "}
            <strong style={{ color: T.text }}>hierro</strong>, sólido. ¡Cámbialas de estado!
          </span>
        </div>
      </div>
    </div>
  );
}

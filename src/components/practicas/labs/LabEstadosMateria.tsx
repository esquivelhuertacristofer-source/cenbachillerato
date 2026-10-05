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
 * EXPERIMENTO CENTRAL: la curva de calentamiento. El alumno añade calor (mechero, hielo seco
 * o deslizador) y la temperatura sube, pero SE DETIENE (meseta) mientras la sustancia cambia de
 * estado: el calor rompe las fuerzas entre partículas, no las acelera.
 *
 * La física se hace VISIBLE con:
 *   · Termómetro de fases (fusión/ebullición marcados, aguja en T actual).
 *   · Lectura EN VIVO del estado + energía cinética relativa.
 *   · Partículas que vibran/fluyen/vuelan según el estado.
 * Si el dispositivo no soporta WebGL, un fallback 2D sigue demostrando la física.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import type { Fase } from "./EstadosMateriaScene";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ESTADOS_MATERIA_FICHA } from "./estados-materia-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./estados-materia-data";
import { LabSfx } from "./lab-audio";

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
  onDragStart,
  onDragEnd,
}: {
  active: boolean;
  swatch: string;
  label: string;
  sub: string;
  onClick: () => void;
  accent: string;
  colorRgba: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}) => (
  <button
    onClick={onClick}
    draggable={!!onDragStart}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
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
      <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>{label}</span>
      <span style={{ display: "block", fontSize: 14, color: T.text3, ...NUM }}>{sub}</span>
    </span>
    {active && <i className="fa-solid fa-check" style={{ fontSize: 12, color: accent }} />}
  </button>
);

/* ── Curva de calentamiento: energía aplicada q (0–100) → temperatura ─────
 * Tramos: sólido sube · meseta de fusión · líquido sube · meseta de ebullición · gas sube.
 * Durante cada meseta la temperatura NO cambia aunque siga entrando calor. */
const Q_SOL = 30;
const Q_FUS = 45;
const Q_LIQ = 70;
const Q_EBU = 88;
const Q_MAX = 100;

interface PuntoCurva {
  temp: number;
  fase: Fase;
  meseta: "fusion" | "ebullicion" | null;
  /** 0–1 dentro de la meseta (fracción ya fundida / evaporada). */
  avance: number;
}

function curvaDe(q: number, s: Sustancia, min: number, max: number): PuntoCurva {
  if (q <= Q_SOL) return { temp: min + ((s.fusion - min) * q) / Q_SOL, fase: "solido", meseta: null, avance: 0 };
  if (q <= Q_FUS) {
    const av = (q - Q_SOL) / (Q_FUS - Q_SOL);
    return { temp: s.fusion, fase: av < 0.5 ? "solido" : "liquido", meseta: "fusion", avance: av };
  }
  if (q <= Q_LIQ) return { temp: s.fusion + ((s.ebullicion - s.fusion) * (q - Q_FUS)) / (Q_LIQ - Q_FUS), fase: "liquido", meseta: null, avance: 0 };
  if (q <= Q_EBU) {
    const av = (q - Q_LIQ) / (Q_EBU - Q_LIQ);
    return { temp: s.ebullicion, fase: av < 0.5 ? "liquido" : "gas", meseta: "ebullicion", avance: av };
  }
  return { temp: s.ebullicion + ((max - s.ebullicion) * (q - Q_EBU)) / (Q_MAX - Q_EBU), fase: "gas", meseta: null, avance: 0 };
}

const Q_LIQUIDO_MEDIO = (Q_FUS + Q_LIQ) / 2;

/** Gráfica T contra calor aplicado, con el punto del alumno. Es EL medidor del experimento. */
function CurvaCalentamiento({ q, s, min, max, temp, faseCol, compacto = false }: {
  q: number; s: Sustancia; min: number; max: number; temp: number; faseCol: string; compacto?: boolean;
}) {
  const W = 300, H = compacto ? 110 : 150, pad = 8;
  const x = (v: number) => pad + (v / Q_MAX) * (W - 2 * pad);
  const y = (t: number) => H - pad - ((t - min) / (max - min || 1)) * (H - 2 * pad);
  const pts = [[0, min], [Q_SOL, s.fusion], [Q_FUS, s.fusion], [Q_LIQ, s.ebullicion], [Q_EBU, s.ebullicion], [Q_MAX, max]] as const;
  const d = pts.map(([qq, tt], i) => `${i ? "L" : "M"}${x(qq).toFixed(1)} ${y(tt).toFixed(1)}`).join(" ");
  const trazo = [[0, min] as const, ...pts.slice(1).filter(([qq]) => qq < q), [q, temp] as const]
    .map(([qq, tt], i) => `${i ? "L" : "M"}${x(qq).toFixed(1)} ${y(tt).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de calentamiento: temperatura contra calor aplicado" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x={x(Q_SOL)} y={pad} width={x(Q_FUS) - x(Q_SOL)} height={H - 2 * pad} fill={C_LIQUIDO} opacity={0.14} />
      <rect x={x(Q_LIQ)} y={pad} width={x(Q_EBU) - x(Q_LIQ)} height={H - 2 * pad} fill={C_GAS} opacity={0.14} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={3} strokeLinejoin="round" />
      <path d={trazo} fill="none" stroke={faseCol} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(q)} cy={y(temp)} r={7} fill={faseCol} stroke="#fff" strokeWidth={2.5} />
    </svg>
  );
}

/* ── Reparto de energía: cinética vs potencial ───────────────────────── */
const EnergyBreakdown = ({ agitacion, enCambio, faseCol }: { agitacion: number; enCambio: boolean; faseCol: string }) => {
  const cin = Math.round(agitacion * 100);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: T.text2 }}>
        <span>Energía cinética media</span>
        <span style={{ color: T.text, fontWeight: 800, ...NUM }}>{cin}%</span>
      </div>
      <div style={{ height: 14, borderRadius: 999, background: T.inset, overflow: "hidden", border: `1px solid ${T.line}` }}>
        <div style={{ width: `${cin}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${faseCol}, ${faseCol}bb)`, transition: "width 0.3s ease" }} />
      </div>
      <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        {enCambio ? (
          <>
            <strong style={{ color: T.text }}>Meseta:</strong> el calor rompe las fuerzas entre partículas (energía potencial) y la temperatura se mantiene constante.
          </>
        ) : (
          <>A mayor temperatura, mayor <strong style={{ color: T.text }}>energía cinética</strong>: las partículas se mueven más rápido.</>
        )}
      </p>
    </div>
  );
};

const CSS_EX = `
.ex-tools { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px; }
.ex-tool { position:relative; cursor:grab; user-select:none; display:flex; flex-direction:column;
  align-items:center; gap:6px; padding:14px 10px 12px; border-radius:14px; text-align:center;
  border:1px solid ${T.line}; background:${T.glass}; transition:transform .14s ease, box-shadow .14s ease, border-color .14s ease; }
.ex-tool:hover { transform:translateY(-2px); border-color:${T.lineStrong}; }
.ex-tool:active { cursor:grabbing; transform:scale(.97); }
.ex-tool[data-tool="calor"]:hover { border-color:${C_GAS}; box-shadow:0 0 20px -6px ${C_GAS}; }
.ex-tool[data-tool="frio"]:hover { border-color:${C_SOLIDO}; box-shadow:0 0 20px -6px ${C_SOLIDO}; }
.ex-tool[data-on="true"] { border-color:currentColor; }
.ex-tool-emoji { font-size:28px; line-height:1; filter:drop-shadow(0 3px 6px rgba(0,0,0,.5)); }
.ex-tool-name { font-size:15px; font-weight:800; color:${T.text}; }
.ex-tool-hint { font-size:14px; font-weight:600; color:${T.text3}; }
.ex-tile:hover { border-color:${T.lineStrong} !important; background:${T.glassSoft} !important; }
@keyframes exHeat { 0%,100%{ opacity:.5; } 50%{ opacity:.95; } }
@keyframes exCold { 0%,100%{ opacity:.45; } 50%{ opacity:.85; } }
.ex-aplica-calor { animation: exHeat 1s ease-in-out infinite;
  background: radial-gradient(120% 70% at 50% 108%, ${C_GAS}55 0%, ${C_GAS}22 35%, transparent 65%); }
.ex-aplica-frio { animation: exCold 1.3s ease-in-out infinite;
  background: radial-gradient(120% 80% at 50% -8%, ${C_SOLIDO}55 0%, ${C_SOLIDO}22 40%, transparent 68%); }
@media (prefers-reduced-motion: reduce){ .ex-aplica-calor, .ex-aplica-frio { animation:none; } }
`;

const RETO_KEY = "cen-estados-materia-reto";

export function LabEstadosMateria({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [sustanciaKey, setSustanciaKey] = useState("agua");
  const [q, setQ] = useState(Q_LIQUIDO_MEDIO); // calor aplicado (0–100): la variable del experimento
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // ── Interacción de ARRASTRE (el alumno experimenta) ────────────────
  // El alumno arrastra el mechero 🔥 sobre la sustancia para calentarla, o el
  // hielo seco 🧊 para enfriarla; también puede arrastrar una sustancia al vaso.
  const [aplicando, setAplicando] = useState<null | "calor" | "frio">(null);
  const [arrastrando, setArrastrando] = useState<null | "calor" | "frio" | "sust">(null);
  const [sobreVaso, setSobreVaso] = useState(false);
  const [experimentado, setExperimentado] = useState(false);
  const dragKindRef = useRef<string | null>(null);
  const heatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sonidoRef = useRef(false);

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
      if (heatTimerRef.current) clearInterval(heatTimerRef.current);
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  // Mantener el ref de sonido sincronizado (lo lee el callback de arrastre).
  useEffect(() => {
    sonidoRef.current = sonido;
  }, [sonido]);

  // Detener la aplicación de calor/frío (al soltar o salir del vaso).
  const detenerAplicacion = useCallback(() => {
    if (heatTimerRef.current) {
      clearInterval(heatTimerRef.current);
      heatTimerRef.current = null;
    }
    setAplicando((prev) => {
      if (prev === "calor") audioRef.current?.fuego(false);
      if (prev === "frio") audioRef.current?.vapor(false);
      return null;
    });
  }, []);

  // Aplicación continua: mientras la herramienta está sobre la sustancia entra (calor) o sale (frío) energía.
  const iniciarAplicacion = useCallback((tool: "calor" | "frio") => {
    if (heatTimerRef.current) clearInterval(heatTimerRef.current);
    setAplicando(tool);
    setExperimentado(true);
    if (sonidoRef.current) {
      if (tool === "calor") audioRef.current?.fuego(true);
      else audioRef.current?.vapor(true);
    }
    heatTimerRef.current = setInterval(() => {
      setQ((v) => Math.max(0, Math.min(Q_MAX, v + (tool === "calor" ? 0.8 : -0.8))));
    }, 55);
  }, []);

  // Un "golpe" puntual (clic/toque: respaldo táctil del arrastre).
  const golpe = useCallback((tool: "calor" | "frio") => {
    setExperimentado(true);
    setQ((v) => Math.max(0, Math.min(Q_MAX, v + (tool === "calor" ? 7 : -7))));
    if (sonidoRef.current) audioRef.current?.blip();
  }, []);

  const sustancia = SUSTANCIAS.find((s) => s.key === sustanciaKey)!;

  // Rango de temperaturas de la gráfica: se adapta a cada sustancia.
  const { min, max } = useMemo(() => {
    const spanReal = sustancia.ebullicion - sustancia.fusion;
    const margen = Math.max(spanReal * 0.45, 25);
    return { min: Math.round(sustancia.fusion - margen), max: Math.round(sustancia.ebullicion + margen) };
  }, [sustancia]);

  const pc = curvaDe(q, sustancia, min, max);
  const temp = Math.round(pc.temp);
  const fase = pc.fase;
  const info = FASE_INFO[fase];

  // Energía cinética relativa = posición de la temperatura en el rango.
  const agitacion = Math.max(0, Math.min(1, (pc.temp - min) / (max - min || 1)));
  const enMeseta = pc.meseta !== null;
  const tempK = temp + 273.15;

  // Al cambiar de sustancia, vuelve al tramo líquido.
  const seleccionarSustancia = (s: Sustancia) => {
    setSustanciaKey(s.key);
    setQ(Q_LIQUIDO_MEDIO);
    if (sonido) audioRef.current?.blip();
  };

  // Saltos rápidos a cada estado
  const irA = (objetivo: Fase) => {
    setQ(objetivo === "solido" ? Q_SOL * 0.5 : objetivo === "gas" ? (Q_EBU + Q_MAX) / 2 : Q_LIQUIDO_MEDIO);
  };

  const textoMeseta = pc.meseta === "fusion" ? "se funde" : "se evapora";
  const lectura = enMeseta
    ? <>Meseta: {textoMeseta} {Math.round(pc.avance * 100)} % y la T no sube</>
    : <>{info.txt} a {fmt(temp)} °C: {fase === "solido" ? "vibran en su sitio" : fase === "liquido" ? "fluyen juntas" : "vuelan libres"}</>;

  // ── Objetivos guiados (se marcan en vivo; useLogros del shell los recuerda) ──
  const objetivos = [
    { txt: "Arrastra el mechero o el hielo a la sustancia", done: experimentado },
    { txt: "Encuentra la meseta: sigue entrando calor y la temperatura se queda quieta", done: enMeseta },
    { txt: "Enfría hasta ver la red cristalina (sólido)", done: fase === "solido", modo: "solido" },
    { txt: "Funde la sustancia (líquido)", done: fase === "liquido", modo: "liquido" },
    { txt: "Sigue calentando hasta evaporar (gas)", done: fase === "gas", modo: "gas" },
    { txt: "Lleva la energía cinética al máximo", done: agitacion > 0.92 },
    { txt: "Resuelve el reto de estados de la materia", done: ejercicioAprobado },
  ];

  // Fallback 2D cuando no hay WebGL: sigue mostrando la física
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: info.col, boxShadow: `0 10px 30px -6px ${info.col}` }}>
        <i className={`fa-solid ${info.icon}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{info.txt}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 320, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue funcionando: revisa la curva de calentamiento en el panel.{" "}
        <strong style={{ color: T.text }}>{fmt(temp)} °C.</strong>
      </div>
    </div>
  );

  const colAplica = aplicando === "frio" ? C_SOLIDO : aplicando === "calor" ? C_GAS : accent;
  const etiquetaEscena = enMeseta
    ? `${pc.meseta === "fusion" ? "Fusión" : "Ebullición"}: ${fmt(temp)} °C constante`
    : `${info.txt}: ${fase === "solido" ? "red rígida" : fase === "liquido" ? "fluyen" : "libres"}`;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        // Zona de SOLTAR para mechero / hielo / sustancia
        <div
          data-sobre={sobreVaso}
          onDragOver={(e) => {
            if (dragKindRef.current) e.preventDefault();
          }}
          onDragEnter={(e) => {
            const k = dragKindRef.current;
            if (!k) return;
            e.preventDefault();
            setSobreVaso(true);
            if (k === "calor" || k === "frio") iniciarAplicacion(k);
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
            setSobreVaso(false);
            detenerAplicacion();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const k = dragKindRef.current;
            if (k && k.startsWith("sust:")) {
              const s = SUSTANCIAS.find((x) => x.key === k.slice(5));
              if (s) seleccionarSustancia(s);
            }
            detenerAplicacion();
            dragKindRef.current = null;
            setArrastrando(null);
            setSobreVaso(false);
          }}
          style={{
            position: "absolute",
            inset: 0,
            outline: sobreVaso && arrastrando ? `2px dashed ${colAplica}` : "none",
            outlineOffset: -6,
            borderRadius: 20,
          }}
        >
          <style>{CSS_EX}</style>
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
              etiqueta={etiquetaEscena}
              etiquetaCol={info.col}
              aplicando={aplicando}
            />
          </SceneBoundary>

          {/* Overlay: la sustancia recibe calor (rojo, abajo) o frío (azul, arriba) */}
          {aplicando && (
            <div aria-hidden className={aplicando === "calor" ? "ex-aplica-calor" : "ex-aplica-frio"} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }} />
          )}

          {/* Guía de soltar mientras se arrastra una herramienta */}
          {arrastrando && !sobreVaso && (
            <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 14, background: "rgba(2,12,28,0.82)", border: `1.5px dashed ${colAplica}`, color: T.text, fontSize: 15, fontWeight: 800 }}>
                <i className={`fa-solid ${arrastrando === "frio" ? "fa-snowflake" : arrastrando === "calor" ? "fa-fire" : "fa-flask"}`} />
                {arrastrando === "sust" ? "Suelta aquí para cargar la sustancia" : "Suelta sobre la sustancia"}
              </div>
            </div>
          )}
        </div>
      }
      modos={{
        opciones: [
          { id: "solido", etiqueta: "Sólido", icono: "fa-cube" },
          { id: "liquido", etiqueta: "Líquido", icono: "fa-droplet" },
          { id: "gas", etiqueta: "Gas", icono: "fa-wind" },
        ],
        valor: fase,
        cambiar: (id) => irA(id as Fase),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reordenar partículas" onClick={() => setResetNonce((n) => n + 1)} />
        </>
      }
      leyenda={
        <div style={{ width: 200, display: "grid", gap: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#dce6f5", ...NUM }}>
            {fmt(temp)} °C · {fmt(tempK)} K
          </div>
          <CurvaCalentamiento q={q} s={sustancia} min={min} max={max} temp={pc.temp} faseCol={info.col} compacto />
        </div>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Calor aplicado" icono="fa-fire">
                <Deslizador
                  label="Calor añadido"
                  icon="fa-temperature-arrow-up"
                  colr={info.col}
                  valor={`${fmt(temp)} °C`}
                  min={0}
                  max={Q_MAX}
                  step={0.5}
                  value={q}
                  onChange={(v) => { setExperimentado(true); setQ(v); }}
                  hintL="frío"
                  hintR="calor"
                />
                <CurvaCalentamiento q={q} s={sustancia} min={min} max={max} temp={pc.temp} faseCol={info.col} />
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${info.col}55`, background: `${info.col}12`, color: T.text2 }}>
                  {enMeseta
                    ? <><strong style={{ color: T.text }}>Meseta de {pc.meseta === "fusion" ? "fusión" : "ebullición"}:</strong> el calor sigue entrando, pero la temperatura se queda en {fmt(temp)} °C hasta que {pc.meseta === "fusion" ? "todo se funde" : "todo se evapora"} ({Math.round(pc.avance * 100)} %).</>
                    : <>Las zonas sombreadas son las mesetas. Pasa el punto por ellas con el deslizador y observa cómo se aplana la línea.</>}
                </p>
              </Bloque>

              <Bloque titulo="Experimenta: arrastra a la sustancia" icono="fa-hand-pointer">
                <div className="ex-tools">
                  <div
                    className="ex-tool"
                    data-tool="calor"
                    data-on={aplicando === "calor"}
                    draggable
                    style={aplicando === "calor" ? { color: C_GAS } : undefined}
                    title="Arrastra el mechero sobre la sustancia para calentarla (o haz clic para un golpe de calor)"
                    onClick={() => golpe("calor")}
                    onDragStart={(e) => {
                      dragKindRef.current = "calor";
                      setArrastrando("calor");
                      e.dataTransfer.effectAllowed = "copy";
                      e.dataTransfer.setData("text/plain", "calor");
                    }}
                    onDragEnd={() => {
                      detenerAplicacion();
                      dragKindRef.current = null;
                      setArrastrando(null);
                      setSobreVaso(false);
                    }}
                  >
                    <span className="ex-tool-emoji">🔥</span>
                    <span className="ex-tool-name">Mechero</span>
                    <span className="ex-tool-hint">arrastra o toca</span>
                  </div>
                  <div
                    className="ex-tool"
                    data-tool="frio"
                    data-on={aplicando === "frio"}
                    draggable
                    style={aplicando === "frio" ? { color: C_SOLIDO } : undefined}
                    title="Arrastra el hielo seco sobre la sustancia para enfriarla (o haz clic para un golpe de frío)"
                    onClick={() => golpe("frio")}
                    onDragStart={(e) => {
                      dragKindRef.current = "frio";
                      setArrastrando("frio");
                      e.dataTransfer.effectAllowed = "copy";
                      e.dataTransfer.setData("text/plain", "frio");
                    }}
                    onDragEnd={() => {
                      detenerAplicacion();
                      dragKindRef.current = null;
                      setArrastrando(null);
                      setSobreVaso(false);
                    }}
                  >
                    <span className="ex-tool-emoji">🧊</span>
                    <span className="ex-tool-name">Hielo seco</span>
                    <span className="ex-tool-hint">arrastra o toca</span>
                  </div>
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Mantén la herramienta sobre la escena y mira cómo cambia el estado. ¿Hay un punto donde la temperatura se queda quieta?
                </p>
              </Bloque>

              <Bloque titulo="Sustancia" icono="fa-flask">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 9 }}>
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
                      onDragStart={(e) => {
                        dragKindRef.current = `sust:${s.key}`;
                        setArrastrando("sust");
                        e.dataTransfer.effectAllowed = "copy";
                        e.dataTransfer.setData("text/plain", s.key);
                      }}
                      onDragEnd={() => {
                        dragKindRef.current = null;
                        setArrastrando(null);
                        setSobreVaso(false);
                      }}
                    />
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Temperatura" value={`${fmt(temp)} °C`} col={info.col} />
                  <Dato label="En kelvin" value={`${fmt(tempK)} K`} />
                  <Dato label="Estado" value={enMeseta ? "Cambio" : info.txt} col={info.col} />
                  <Dato label="Fusión / ebull." value={`${fmt(sustancia.fusion)} / ${fmt(sustancia.ebullicion)}`} />
                </div>
                <EnergyBreakdown agitacion={agitacion} enCambio={enMeseta} faseCol={info.col} />
              </Bloque>
            </>
          ),
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
              <Bloque titulo="Cada estado" icono="fa-cubes">
                {(Object.keys(FASE_INFO) as Fase[]).map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${FASE_INFO[f].icon}`} style={{ color: FASE_INFO[f].col, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong>{FASE_INFO[f].txt}</strong>
                      <div style={{ color: T.text2 }}>{FASE_INFO[f].sub}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Idea clave" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  La materia cambia de estado porque cambia la <strong style={{ color: "#fff" }}>energía</strong> de sus partículas, no la
                  sustancia. Arrastra el mechero hasta evaporar el <strong style={{ color: "#fff" }}>hierro</strong>, o el hielo seco hasta
                  congelar el <strong style={{ color: "#fff" }}>oxígeno</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ESTADOS_MATERIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

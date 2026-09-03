"use client";

/**
 * Laboratorio 3D — Modelado y estimación con cónicas.
 * Pensamiento Matemático IV («Trigonometría y geometría analítica»).
 * Propósito PM-IV P07: aplicar ecuaciones con dos variables para estimar.
 *
 * Tres modos en un mismo visor:
 *   • CORTAR EL CONO — un cono de doble napa y un plano inclinable generan las
 *     cuatro cónicas (circunferencia, elipse, parábola, hipérbola) según el
 *     ángulo del plano.
 *   • ANTENA (parábola) — y = 0.25·x²: los rayos paralelos al eje se concentran
 *     en el FOCO (0, 1).
 *   • COBERTURA (círculo) — x² + y² = 25: la casa (3, 4) cae justo en el borde.
 *
 * Contenido VERBATIM del Modelo MCCEMS 2025 (anclas PM-IV-P08-A1 / A2).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import { MODELADO_CONICAS_FICHA } from "./modelado-conicas-ficha";
import {
  VARIANTES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  OBJETIVOS,
  CORTES_PRESET,
  clasificaCorte,
  GAMMA_PARABOLA,
  RETO_CONICAS,
  PARABOLA,
  COBERTURA,
  type Variante,
} from "./modelado-conicas-data";

const ModeladoConicasScene = dynamic(() => import("./ModeladoConicasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bezier-curve fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const ORO = "#ffd24a";
const VERDE = "#34D399";
const AZUL = "#5fb0ff";

// Pilar EQUIPARSE: el "equipo" del geómetra analítico (3 correctos + 3 distractores).
const INSTRUMENTOS: EppItem[] = [
  { key: "plano", nombre: "Plano cartesiano", icono: "fa-table-cells", ok: true, nota: "Ubica cada punto (x, y) y traza la cónica con precisión." },
  { key: "compas", nombre: "Compás", icono: "fa-compass-drafting", ok: true, nota: "Dibuja circunferencias de radio exacto a partir del centro." },
  { key: "calc", nombre: "Calculadora", icono: "fa-calculator", ok: true, nota: "Evalúa la ecuación y estima alturas y distancias." },
  { key: "imán", nombre: "Imán", icono: "fa-magnet", ok: false, nota: "Mide campos magnéticos; no interviene en geometría analítica." },
  { key: "probeta", nombre: "Probeta", icono: "fa-flask", ok: false, nota: "Mide volúmenes de líquido; aquí no se usa." },
  { key: "termo", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no aporta a modelar una cónica." },
];

const RETO_KEY = "cen-modelado-conicas-estimacion-reto";

function LabModeladoConicas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Variante>("seccion");
  const [gammaDeg, setGammaDeg] = useState<number>(0); // ángulo del plano (modo sección)
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCirc, setVioCirc] = useState(false);
  const [vioElipse, setVioElipse] = useState(false);
  const [vioParabola, setVioParabola] = useState(false);
  const [vioHiperbola, setVioHiperbola] = useState(false);
  const [vioAntena, setVioAntena] = useState(false);
  const [vioCobertura, setVioCobertura] = useState(false);

  const [eppListo, setEppListo] = useState(false);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

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

  const bump = () => setResetNonce((k) => k + 1);

  const clase = useMemo(() => clasificaCorte(gammaDeg), [gammaDeg]);

  // marca el "visto" de cada cónica según el ángulo del corte (en los handlers,
  // nunca en un effect, para no disparar renders en cascada)
  const marcarVisto = useCallback((g: number) => {
    const t = clasificaCorte(g).tipo;
    if (t === "circunferencia") setVioCirc(true);
    else if (t === "elipse") setVioElipse(true);
    else if (t === "parabola") setVioParabola(true);
    else if (t === "hiperbola") setVioHiperbola(true);
  }, []);

  const elegirModo = (m: Variante) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "parabola") setVioAntena(true);
    if (m === "circunferencia") setVioCobertura(true);
    if (m === "seccion") marcarVisto(gammaDeg);
  };

  const ponerCorte = (g: number) => {
    setModo("seccion");
    setGammaDeg(g);
    marcarVisto(g);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => {
    setModo("seccion");
    setGammaDeg(0);
    bump();
  };

  const modoActual = VARIANTES.find((v) => v.id === modo) ?? VARIANTES[0]!;

  const objetivos = [
    { txt: "Equípate con el instrumental de geometría analítica", done: eppListo },
    { txt: "Genera la circunferencia y la elipse cortando el cono", done: vioCirc && vioElipse },
    { txt: "Obtén la parábola y la hipérbola variando el ángulo", done: vioParabola && vioHiperbola },
    { txt: "Modela la antena y localiza su foco", done: vioAntena },
    { txt: "Estima el alcance con la circunferencia de cobertura", done: vioCobertura },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bezier-curve" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Las cónicas: cortar un cono con un plano</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: según el ángulo del plano, el corte de un cono produce una circunferencia, una elipse, una parábola o una hipérbola. Cada una tiene una ecuación con dos variables que permite modelar y estimar fenómenos reales, como una antena parabólica (y = 0.25·x²) o el alcance de una señal (x² + y² = 25).
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes mcoPulse { 0%,100%{ box-shadow:0 0 0 0 var(--mco); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .mco-live-dot { animation: mcoPulse 1.6s ease-in-out infinite; }
        .mco-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .mco-grid { grid-template-columns: 1fr; } }
        .mco-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .mco-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .mco-icobtn:hover { background:rgba(255,255,255,0.12); }
        .mco-divider { height:1px; background:${T.line}; margin:18px 0; }
        .mco-modgrid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; }
        @media (max-width: 560px){ .mco-modgrid { grid-template-columns: 1fr; } }
        .mco-modbtn { cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; transition:all .15s; }
        .mco-modbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .mco-modbtn[data-on="true"] { border-color:var(--mco); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--mco); }
        .mco-presets { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
        .mco-preset { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px;
          padding:9px 11px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; transition:all .15s; }
        .mco-preset:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .mco-preset[data-on="true"] { border-color:var(--mco); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--mco); }
        .mco-steps { display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; }
        @media (max-width: 760px){ .mco-steps { grid-template-columns: 1fr 1fr; } }
        .mco-step { display:flex; gap:10px; align-items:flex-start; padding:11px 12px; border-radius:13px;
          border:1px solid ${T.line}; background:${T.inset}; transition:all .18s; }
        .mco-step[data-on="true"] { border-color:var(--mco); background:rgba(${color.rgba},0.12); box-shadow:0 4px 16px -8px var(--mco); }
        .mco-step-n { flex-shrink:0; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; color:${T.text3}; background:${T.glass}; border:1px solid ${T.line}; }
        .mco-step[data-on="true"] .mco-step-n { color:#04121f; background:var(--mco); border-color:var(--mco); }
        .mco-step-tx { font-size:11.5px; line-height:1.4; color:${T.text2}; }
        .mco-step[data-on="true"] .mco-step-tx { color:#fff; }
        .mco-step-tx strong { display:block; font-size:12px; color:${T.text}; margin-bottom:1px; }
        .mco-slider { width:100%; accent-color:${accent}; cursor:pointer; }

        .mco-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .mco-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .mco-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .mco-drawer[data-open="true"] { transform:translateX(0); }
        .mco-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .mco-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .mco-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .mco-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .mco-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .mco-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
        @media (max-width: 1000px){ .mco-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── Pasos guiados ──────────────────────────────────────────── */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: 18 }}>
        <Eyebrow>
          <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
          Sigue los pasos del experimento
        </Eyebrow>
        <div className="mco-steps" style={{ ["--mco" as string]: accent }}>
          {[
            { n: 1, done: eppListo, t: "Equípate", d: "Elige el instrumental de geometría analítica." },
            { n: 2, done: vioCirc && vioElipse, t: "Corta el cono", d: "Genera circunferencia y elipse con el plano." },
            { n: 3, done: vioParabola && vioHiperbola, t: "Inclina más", d: "Obtén la parábola y la hipérbola." },
            { n: 4, done: vioAntena || vioCobertura, t: "Modela", d: "Antena con foco y alcance de señal." },
            { n: 5, done: ejercicioAprobado, t: "Resuelve A2", d: "Aprueba el reto evaluable." },
          ].map((s) => (
            <div key={s.n} className="mco-step" data-on={s.done}>
              <span className="mco-step-n">{s.done ? <i className="fa-solid fa-check" /> : s.n}</span>
              <span className="mco-step-tx">
                <strong>{s.t}</strong>
                {s.d}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mco-grid">
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
              <ModeladoConicasScene
                modo={modo}
                gammaDeg={gammaDeg}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Prepara tu mesa de geometría analítica"
                subtitulo="Antes de modelar las cónicas, equípate con lo correcto"
                intro={`Para ubicar puntos (x, y), trazar circunferencias y estimar con la ecuación necesitas el instrumental adecuado. Selecciona solo las ${INSTRUMENTOS.filter((i) => i.ok).length} piezas que sirven (deja fuera lo que mide otra cosa).`}
                verbo="trazo y cálculo"
                onEntrar={() => {
                  setEppListo(true);
                  if (sonido) audioRef.current?.blip();
                }}
              />
            )}

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="mco-live-dot" style={{ ["--mco" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className={`fa-solid ${modoActual.icon}`} style={{ marginRight: 8 }} />
                {modo === "seccion" ? clase.nombre : modoActual.nombre}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="mco-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="mco-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="mco-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="mco-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="mco-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura del modo actual */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 680 }}>
                {modo === "seccion" ? (
                  <>
                    <strong style={{ color: clase.color }}>{clase.nombre}</strong> — {clase.ecuacion}. {clase.descripcion}
                  </>
                ) : modo === "parabola" ? (
                  <>
                    <strong style={{ color: ORO }}>Antena parabólica</strong> y = 0.25·x². Los rayos paralelos al eje (azul) se reflejan y se concentran en el <strong style={{ color: VERDE }}>foco (0, 1)</strong>: por eso las antenas y los faros son parabólicos.
                  </>
                ) : (
                  <>
                    <strong style={{ color: AZUL }}>Cobertura</strong> x² + y² = 25 (radio 5 km). La casa <strong style={{ color: VERDE }}>(3, 4)</strong> cumple 3²+4² = 25 = r²: está justo en el borde del alcance.
                  </>
                )}
              </div>
            </div>

            <button className="mco-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles: modo + ángulo / presets */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              ¿Qué quieres explorar?
            </Eyebrow>
            <div className="mco-modgrid">
              {VARIANTES.map((v) => (
                <button
                  key={v.id}
                  className="mco-modbtn"
                  data-on={modo === v.id}
                  onClick={() => elegirModo(v.id)}
                  style={{ ["--mco" as string]: accent }}
                >
                  <i className={`fa-solid ${v.icon}`} style={{ fontSize: 17, color: modo === v.id ? accent : T.text3 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: modo === v.id ? accent : T.text }}>{v.nombre}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 10 }}>{modoActual.desc}</div>

            {/* Control del ángulo del plano (solo modo sección) */}
            <div style={{ marginTop: 16, opacity: modo === "seccion" ? 1 : 0.4, pointerEvents: modo === "seccion" ? "auto" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text3, letterSpacing: "0.04em" }}>
                  ÁNGULO DEL PLANO DE CORTE
                </span>
                <span style={{ fontSize: 13, fontWeight: 900, color: clase.color, fontFamily: "ui-monospace, monospace" }}>
                  γ = {gammaDeg.toFixed(0)}° → {clase.nombre}
                </span>
              </div>
              <input
                className="mco-slider"
                type="range"
                min={0}
                max={85}
                step={1}
                value={gammaDeg}
                onChange={(e) => {
                  const g = Number(e.target.value);
                  setModo("seccion");
                  setGammaDeg(g);
                  marcarVisto(g);
                }}
              />
              <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
                Horizontal (0°) → circunferencia · inclinado → elipse · paralelo a la generatriz ({GAMMA_PARABOLA}°) → parábola · más inclinado → hipérbola.
              </div>
              <div className="mco-presets" style={{ marginTop: 12, ["--mco" as string]: accent }}>
                {CORTES_PRESET.map((p) => {
                  const c = clasificaCorte(p.gamma);
                  return (
                    <button
                      key={p.tipo}
                      className="mco-preset"
                      data-on={modo === "seccion" && Math.abs(gammaDeg - p.gamma) < 0.5}
                      onClick={() => ponerCorte(p.gamma)}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 900, color: c.color }}>
                        <i className={`fa-solid ${c.icono}`} style={{ marginRight: 7 }} />{c.nombre}
                      </span>
                      <span style={{ fontSize: 10.5, color: T.text3 }}>{p.etiqueta} · γ = {p.gamma}°</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lectura del modelo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              {modo === "seccion" ? "La cónica del corte" : modo === "parabola" ? "El modelo de la antena" : "El modelo de cobertura"}
            </Eyebrow>
            {modo === "seccion" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Tipo de cónica" value={clase.nombre} col={clase.color} size={15} />
                  <Readout label="Ángulo del plano" value={`${gammaDeg.toFixed(0)}°`} col={AZUL} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                  Ecuación canónica: <strong style={{ color: clase.color }}>{clase.ecuacion}</strong>. {clase.descripcion}
                </div>
              </>
            ) : modo === "parabola" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Coeficiente a" value={`${PARABOLA.a}`} col={ORO} size={15} />
                  <Readout label="Foco" value={`(0, ${PARABOLA.foco})`} col={VERDE} size={15} />
                  <Readout label="y a x = 2" value={`${PARABOLA.a * 4} m`} col={AZUL} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                  La antena <strong style={{ color: ORO }}>y = 0.25·x²</strong> pasa por (1, 0.25). Su <strong style={{ color: VERDE }}>foco</strong> está en (0, 1/(4a)) = (0, 1): ahí va el receptor, porque todos los rayos paralelos al eje se concentran en ese punto.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Radio r" value={`${COBERTURA.radio} km`} col={AZUL} size={15} />
                  <Readout label="Casa (3,4): 3²+4²" value={`${COBERTURA.casaDist2}`} col={VERDE} size={15} />
                  <Readout label="r²" value={`${COBERTURA.radio * COBERTURA.radio}`} col={AZUL} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                  La cobertura es <strong style={{ color: AZUL }}>x² + y² = 25</strong>. Para la casa en (3, 4): 3²+4² = 9+16 = <strong style={{ color: VERDE }}>25 = r²</strong>, así que cae justo en el borde. Si x²+y² &lt; 25 hay señal (dentro) y si &gt; 25 no la hay (fuera).
                </div>
              </>
            )}

            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 7 }}>
                <i className="fa-solid fa-route" style={{ marginRight: 7, color: accent }} />
                Modelar y estimar en 3 pasos
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                (1) Identifica qué cónica describe la situación. (2) Escribe su ecuación con los datos. (3) Úsala para estimar el valor buscado.
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Qué son las secciones cónicas</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Las <strong style={{ color: T.text }}>secciones cónicas</strong> —circunferencia, parábola, elipse e hipérbola— son las curvas que se obtienen al cortar un cono con un plano. El <strong style={{ color: accent }}>ángulo del plano</strong> decide cuál aparece, y cada una tiene una ecuación con dos variables que sirve para <strong style={{ color: AZUL }}>modelar y estimar</strong>.
          </div>

          <div className="mco-divider" />

          <Eyebrow>Las cuatro cónicas</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={AZUL} icon="fa-circle" titulo="Circunferencia — plano horizontal">
              (x−h)²+(y−k)²=r². Todos los puntos a la misma distancia r del centro. Modela el alcance de una señal.
            </Parte>
            <Parte col={VERDE} icon="fa-egg" titulo="Elipse — plano inclinado">
              x²/a²+y²/b²=1. Curva cerrada con dos focos. Modela las órbitas (Kepler) y los arcos.
            </Parte>
            <Parte col={ORO} icon="fa-satellite-dish" titulo="Parábola — paralelo a la generatriz">
              y=a·x². Concentra los rayos paralelos en el foco: antenas, telescopios y faros.
            </Parte>
            <Parte col="#f0a6ff" icon="fa-bezier-curve" titulo="Hipérbola — corta las dos napas">
              x²/a²−y²/b²=1. Dos ramas abiertas. Modela la proporcionalidad inversa (ley de Boyle) y la navegación.
            </Parte>
          </div>

          <div className="mco-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Las antenas <strong>DISH/SKY</strong> y el internet satelital usan reflectores <strong style={{ color: ORO }}>parabólicos</strong>; el satélite <strong>Mexsat</strong> sigue una órbita <strong style={{ color: VERDE }}>elíptica</strong> (Kepler); la <strong>cobertura</strong> de una antena de telefonía se modela con una <strong style={{ color: AZUL }}>circunferencia</strong> x²+y²≤r².
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="mco-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? OK : T.text2 }}>
                <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
                <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Para el reto A2: la antena <strong style={{ color: ORO }}>y = a·x²</strong> pasa por (1, 0.25), así que a = 0.25; a x = 2 sube 0.25·4 = 1 m. El alcance de 5 km es <strong style={{ color: AZUL }}>x²+y²=25</strong>, y la casa (3, 4) da 3²+4² = 25: está en el borde.
          </span>
        </div>
      </div>

      {/* ── Ideas + glosario ────────────────────────────────────────── */}
      <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
          Ideas clave
        </Eyebrow>
        <ul style={{ margin: "4px 0 4px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          {IDEAS.map((idea, i) => (
            <li key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{idea}</li>
          ))}
        </ul>

        <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 11, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
          <strong style={{ color: accent }}>Contexto. </strong>{CONTEXTO}
        </div>

        <div className="mco-divider" />

        <Eyebrow>Glosario</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {GLOSARIO.map((g) => (
            <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 3 }}>{g.termino}</div>
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</div>
              <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} />{g.ejemplo}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          <i className="fa-solid fa-book" style={{ marginRight: 6 }} />{FUENTE}
        </div>
      </div>

      {/* ── Reto evaluable ──────────────────────────────────────────── */}
      <RetoNumericoCard
        reto={RETO_CONICAS}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={() => {
          if (sonido) audioRef.current?.correcto();
        }}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="mco-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="mco-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="mco-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="mco-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="mco-drawer-body">
          <FichaTeorica data={MODELADO_CONICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      {/* objetivos verbatim (referencia para lectura) */}
      <div style={{ display: "none" }} aria-hidden>{OBJETIVOS.join(" · ")}</div>
    </div>
  );
}

/* ── Tarjeta de "parte" en el panel lateral ──────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

export { LabModeladoConicas };
export default LabModeladoConicas;

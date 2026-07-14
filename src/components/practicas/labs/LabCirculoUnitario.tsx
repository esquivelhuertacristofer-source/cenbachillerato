"use client";

/**
 * Laboratorio 3D — El círculo unitario genera las ondas seno y coseno.
 * Práctica experimental para PM-IV-P04-A2 (ejercicio_matematico; progresión 4).
 *
 * El alumno gira el radio del círculo unitario (ángulo θ) y ve, en vivo, cómo el
 * punto P = (cos θ, sen θ) recorre el círculo mientras su ALTURA dibuja la onda
 * SENO y su posición HORIZONTAL dibuja la onda COSENO. Una hélice opcional revela
 * que ambas ondas son las dos sombras del mismo punto girando en el tiempo.
 * Incluye valores EXACTOS en los ángulos notables (√3/2, √2/2, π/6…), la regla de
 * signos por cuadrante y la identidad sen²θ + cos²θ = 1. Matemática exacta.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { CIRCULO_FICHA } from "./circulo-unitario-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  calcTrig, valorExacto, CUADRANTES, ESCENARIOS, IDEAS, DATOS,
  THETA_MIN, THETA_MAX, THETA_STEP, THETA_DEF,
  RETO_A2,
  fmtNum, fmtNum2, fmtDeg, fmtTan, type Escenario,
} from "./circulo-unitario-data";

const CirculoUnitarioScene = dynamic(() => import("./CirculoUnitarioScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-compass-drafting fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Dibujando el círculo unitario…</span>
    </div>
  ),
});

const SIN_COL = "#34D399";
const COS_COL = "#60a5fa";
const TAN_COL = "#f472b6";
const WARN = "#FF8A3C";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-circulo-reto";

/* Instrumentos de trazo (pilar EQUIPARSE) — 3 correctos + 3 distractores. */
const INSTRUMENTOS: EppItem[] = [
  { key: "transportador", nombre: "Transportador", icono: "fa-ruler-combined", ok: true, nota: "Mide el ángulo θ en grados sobre el círculo." },
  { key: "compas", nombre: "Compás", icono: "fa-compass-drafting", ok: true, nota: "Traza el círculo de radio 1 con precisión." },
  { key: "regla", nombre: "Regla graduada", icono: "fa-ruler", ok: true, nota: "Mide los catetos sen θ y cos θ del triángulo." },
  { key: "audifonos", nombre: "Audífonos", icono: "fa-headphones", ok: false, nota: "Te distraen; no sirven para trazar ni medir ángulos." },
  { key: "chicle", nombre: "Goma de mascar", icono: "fa-cookie-bite", ok: false, nota: "No es un instrumento de trazo geométrico." },
  { key: "mochila", nombre: "Mochila", icono: "fa-bag-shopping", ok: false, nota: "Guárdala: no se usa para construir el círculo." },
];

export function LabCirculoUnitario({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [theta, setTheta] = useState(THETA_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarCos, setMostrarCos] = useState(true);
  const [mostrarHelice, setMostrarHelice] = useState(true);
  const [mostrarTan, setMostrarTan] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // pilares: equiparse, arrastrar, calcular
  const [eppListo, setEppListo] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const [mejorEstrellas, setMejorEstrellas] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try { return Number(window.localStorage.getItem(RETO_KEY)) || 0; } catch { return 0; }
  });

  // reto evaluable, teoría (cajón deslizable) y sonido
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

  // Barrido automático del ángulo (oscilloscopio): rAF en effect → sí actualiza
  // las lecturas. El timestamp lo da requestAnimationFrame (no Date.now()).
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setTheta((prev) => (prev + dt * 0.05) % 360); // ~50°/s → vuelta en ~7 s
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const t = useMemo(() => calcTrig(theta), [theta]);
  const exacto = useMemo(() => valorExacto(theta), [theta]);
  const pit = useMemo(() => t.sin * t.sin + t.cos * t.cos, [t]);

  const cuad = t.cuadrante === "eje" ? null : CUADRANTES[t.cuadrante - 1]!;
  const cuadColor = cuad?.color ?? "#94a3b8";

  const setManual = (v: number) => { setReproduciendo(false); setTheta(v); };
  const aplicar = (e: Escenario) => {
    setReproduciendo(false);
    setTheta(e.deg);
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const reset = () => { setReproduciendo(false); setTheta(THETA_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  // arrastre del punto P en la escena 3D (pilar "manipular")
  const onArrastraTheta = useCallback((deg: number) => {
    setReproduciendo(false);
    setArrastro(true);
    setTheta(((deg % 360) + 360) % 360);
  }, []);
  const onGrabPunto = useCallback(() => { if (sonido) audioRef.current?.blip(); }, [sonido]);

  // registro del reto de cálculo (estrellas + récord local)
  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    setMejorEstrellas((prev) => {
      const mejor = Math.max(prev, est);
      try { window.localStorage.setItem(RETO_KEY, String(mejor)); } catch { /* ignore */ }
      return mejor;
    });
    void guardarEstrellas(RETO_KEY, est);
  }, []);

  const senStr = exacto ? exacto.sinStr : fmtNum(t.sin);
  const cosStr = exacto ? exacto.cosStr : fmtNum(t.cos);
  const tanStr = exacto ? (exacto.tanStr === "∄" ? "∄ (indef.)" : exacto.tanStr) : fmtTan(t.tan);
  const radStr = exacto ? `${exacto.radStr} rad` : `${fmtNum2(t.rad)} rad`;

  const aplicado = ESCENARIOS.some((e) => Math.abs(theta - e.deg) < 0.5);

  const pasos = [
    { txt: "Equípate con tus instrumentos de trazo", done: eppListo },
    { txt: "Arrastra el punto P por el círculo para fijar θ", done: arrastro },
    { txt: "Aplica un ángulo notable y léelo", done: aplicado },
    { txt: "Calcula sen θ y gana estrellas", done: predicho },
  ];
  const pasoActivo = pasos.findIndex((p) => !p.done);

  const objetivos = [
    { txt: "Equípate con los instrumentos de trazo correctos", done: eppListo },
    { txt: "Arrastra el punto P y observa P = (cos θ, sen θ)", done: arrastro },
    { txt: "Aplica un ángulo clave (30°, 45°, 60°, 90°, 135°, 210° o 300°)", done: aplicado },
    { txt: "Identifica el cuadrante activo y su regla de signos", done: t.cuadrante !== "eje" },
    { txt: "Verifica la identidad pitagórica en un ángulo notable", done: Math.abs(pit - 1) < 0.001 },
    { txt: "Calcula sen θ en el reto y gana estrellas", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-compass-drafting" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El punto que gira es (cos θ, sen θ)</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar el círculo en 3D, pero la idea sigue: en el círculo unitario (radio 1) el punto vale siempre (cos θ, sen θ). Su altura es el seno y su base el coseno; al girar, esas medidas dibujan las ondas. Usa el control y las lecturas para comprobarlo.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseU { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseU 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-tog { cursor:pointer; display:flex; align-items:center; gap:8px; padding:9px 12px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; }
        .ex-tog[data-on="true"] { color:#fff; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ex-drawer[data-open="true"] { transform:translateX(0); }
        .ex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }

        /* Pasos guiados */
        .ex-steps { display:flex; flex-wrap:wrap; gap:8px; }
        .ex-step { display:flex; align-items:center; gap:9px; padding:9px 13px; border-radius:12px; flex:1 1 180px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12.5px; font-weight:700; transition:all .18s; }
        .ex-step[data-state="active"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 0 1px rgba(${color.rgba},0.4); }
        .ex-step[data-state="done"] { border-color:${OK}66; background:${OK}14; color:${OK}; }
        .ex-step-n { width:24px; height:24px; flex-shrink:0; border-radius:7px; display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; background:rgba(255,255,255,0.08); color:inherit; }
        .ex-step[data-state="active"] .ex-step-n { background:${accent}; color:#04121f; }
        .ex-step[data-state="done"] .ex-step-n { background:${OK}; color:#04121f; }

        /* Reto de cálculo */
        .calc-in { width:100%; padding:11px 13px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:16px; font-weight:800; font-family:ui-monospace, monospace; outline:none; transition:border-color .15s; }
        .calc-in:focus { border-color:${accent}; }
        .calc-btn { cursor:pointer; border:none; border-radius:11px; font-size:13.5px; font-weight:800; padding:11px 16px; transition:filter .15s; }
        .calc-btn-primary { background:${accent}; color:#04121f; }
        .calc-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .calc-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
        .calc-btn-ghost { background:${T.inset}; color:${T.text2}; border:1px solid ${T.line}; }
        .calc-btn-ghost:hover { color:#fff; border-color:${T.lineStrong}; }
      `}</style>

      {/* ── Pasos guiados ─────────────────────────────────────────────────── */}
      <div className="ex-steps" style={{ marginBottom: 18 }}>
        {pasos.map((p, i) => {
          const estado = p.done ? "done" : i === pasoActivo ? "active" : "todo";
          return (
            <div key={i} className="ex-step" data-state={estado}>
              <span className="ex-step-n">{p.done ? <i className="fa-solid fa-check" /> : i + 1}</span>
              <span>{p.txt}</span>
            </div>
          );
        })}
      </div>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0a1730 0%,#06101f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <CirculoUnitarioScene
                thetaDeg={theta}
                accent={accent}
                mostrarCos={mostrarCos}
                mostrarHelice={mostrarHelice}
                mostrarTan={mostrarTan}
                autoRotate={autoRotate}
                pausado={false}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onThetaChange={onArrastraTheta}
                onGrab={onGrabPunto}
              />
            </SceneBoundary>

            {/* Compuerta de equipamiento (pilar EQUIPARSE) */}
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Antes de trazar: equípate"
                subtitulo="Elige tus instrumentos de trazo"
                intro="Para construir y medir ángulos en el círculo unitario necesitas tus instrumentos de trazo. Selecciona los 3 instrumentos correctos (no los distractores) para entrar."
                verbo="instrumentos de trazo"
                onEntrar={() => { setEppListo(true); if (sonido) audioRef.current?.blip(); }}
              />
            )}

            {/* Cinta EN VIVO — ángulo y punto */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>θ = {fmtDeg(t.deg)}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text3 }}>· {radStr}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={reproduciendo} onClick={() => setReproduciendo((p) => !p)} title={reproduciendo ? "Pausar el giro" : "Girar el radio (barrido)"}>
                <i className={`fa-solid ${reproduciendo ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: punto + cuadrante */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13.5, color: "#eaf0fb", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                P = (cos θ, sen θ) = (<span style={{ color: COS_COL }}>{fmtNum2(t.cos)}</span>, <span style={{ color: SIN_COL }}>{fmtNum2(t.sin)}</span>)
              </div>
              <div style={{ fontSize: 12.5, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                <i className="fa-solid fa-compass" style={{ color: cuadColor, marginRight: 7 }} />
                {cuad ? `Cuadrante ${cuad.q} (${cuad.rango}): ${cuad.positivas}.` : "Sobre un eje: una de las razones vale 0 (o ±1)."}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Gira el radio: ángulo θ
            </Eyebrow>
            <Deslizador label="θ · ángulo del radio" icon="fa-rotate" colr={accent}
              valor={fmtDeg(t.deg)} min={THETA_MIN} max={THETA_MAX} step={THETA_STEP} value={theta}
              onChange={setManual} hintL="0°" hintR="360° (vuelta completa)" />
            <div style={{ marginTop: 10, fontSize: 11.8, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8, alignItems: "center" }}>
              <i className="fa-solid fa-hand-pointer" style={{ color: accent }} />
              <span>También puedes <strong style={{ color: "#fff" }}>arrastrar el punto P</strong> directamente sobre el círculo en la escena 3D.</span>
            </div>

            {/* toggles de visualización */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <button className="ex-tog" data-on={mostrarCos} onClick={() => setMostrarCos((v) => !v)} style={{ borderColor: mostrarCos ? `${COS_COL}88` : T.line, background: mostrarCos ? `${COS_COL}1a` : T.inset }}>
                <i className={`fa-solid ${mostrarCos ? "fa-eye" : "fa-eye-slash"}`} style={{ color: COS_COL }} /> Onda coseno
              </button>
              <button className="ex-tog" data-on={mostrarHelice} onClick={() => setMostrarHelice((v) => !v)} style={{ borderColor: mostrarHelice ? "#f5d36b88" : T.line, background: mostrarHelice ? "#f5d36b1a" : T.inset }}>
                <i className={`fa-solid ${mostrarHelice ? "fa-eye" : "fa-eye-slash"}`} style={{ color: "#f5d36b" }} /> Hélice
              </button>
              <button className="ex-tog" data-on={mostrarTan} onClick={() => setMostrarTan((v) => !v)} style={{ borderColor: mostrarTan ? `${TAN_COL}88` : T.line, background: mostrarTan ? `${TAN_COL}1a` : T.inset }}>
                <i className={`fa-solid ${mostrarTan ? "fa-eye" : "fa-eye-slash"}`} style={{ color: TAN_COL }} /> Tangente
              </button>
            </div>

            {/* escenarios guiados */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>ÁNGULOS CLAVE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc} data-on={Math.abs(t.deg - e.deg) < 0.5}
                  onClick={() => aplicar(e)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Los cuatro cuadrantes (regla de signos) */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-compass" style={{ marginRight: 8, color: accent }} />
              Regla de signos por cuadrante
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {CUADRANTES.map((q) => {
                const on = cuad?.q === q.q;
                return (
                  <div key={q.q} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 13px", borderRadius: 12, border: `1px solid ${on ? q.color + "88" : T.line}`, background: on ? `${q.color}18` : T.inset, transition: "all .2s" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: on ? "#04121f" : q.color, background: on ? q.color : `${q.color}22`, flexShrink: 0 }}>
                      Q{q.q}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 900, color: on ? "#fff" : T.text2, fontFamily: "ui-monospace, monospace" }}>
                        sen {q.sin} · cos {q.cos} · tan {q.tan}
                      </div>
                      <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4, marginTop: 2 }}>{q.rango} · {q.positivas}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Razones de θ */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-wave-square" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Razones en θ = {fmtDeg(t.deg)}</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 800 }}>{radStr}{exacto ? " · ángulo notable" : ` · ref. ${fmtDeg(t.refDeg)}`}</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              <RazonRow label="sen θ" valor={senStr} col={SIN_COL} icon="fa-arrows-up-down" />
              <RazonRow label="cos θ" valor={cosStr} col={COS_COL} icon="fa-arrows-left-right" />
              <RazonRow label="tan θ" valor={tanStr} col={TAN_COL} icon="fa-slash" />
            </div>
            {exacto && (
              <div style={{ marginTop: 10, fontSize: 11.5, color: T.text2, lineHeight: 1.45, padding: "9px 11px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
                Valores <strong style={{ color: "#fff" }}>exactos</strong> (ángulo notable). En decimal: sen = {fmtNum(t.sin)}, cos = {fmtNum(t.cos)}.
              </div>
            )}
          </div>

          {/* Identidad pitagórica */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-square-root-variable" style={{ marginRight: 8, color: accent }} />
              Identidad pitagórica
            </Eyebrow>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", textAlign: "center", padding: "12px 8px", borderRadius: 12, background: T.inset, border: `1px solid ${T.line}` }}>
              sen²θ + cos²θ = 1
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 11.5, color: T.text2 }}>Comprobación ahora</span>
              <span style={{ fontSize: 13.5, fontWeight: 900, color: OK, fontFamily: "ui-monospace, monospace" }}>
                {fmtNum2(t.sin * t.sin)} + {fmtNum2(t.cos * t.cos)} = {fmtNum2(pit)}
              </span>
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 11 }}>
              Es el <strong style={{ color: accent }}>Teorema de Pitágoras</strong> del triángulo dentro del círculo: los catetos son <strong style={{ color: SIN_COL }}>sen θ</strong> y <strong style={{ color: COS_COL }}>cos θ</strong>, y la hipotenusa es el radio = 1.
            </div>
          </div>

          {/* Del triángulo al círculo */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-nodes" style={{ marginRight: 8, color: accent }} />
              Del triángulo al círculo
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              En el triángulo rectángulo el seno y el coseno solo existen de 0° a 90°. El círculo unitario los <strong style={{ color: "#fff" }}>extiende a cualquier ángulo</strong>: más allá de 90° el punto sigue teniendo coordenadas, así que sen y cos siguen definidos —solo cambian de signo según el cuadrante—. Por eso son <strong style={{ color: accent }}>funciones periódicas</strong>.
            </div>
          </div>

          {/* Hélice / desfase */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-wave-square" style={{ marginRight: 8, color: "#f5d36b" }} />
              Seno y coseno: desfase 90°
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              Activa la <strong style={{ color: "#f5d36b" }}>hélice</strong>: es la curva que traza el punto al girar mientras avanza el tiempo. Su sombra en el muro es la <strong style={{ color: SIN_COL }}>onda seno</strong> y su sombra en el piso es la <strong style={{ color: COS_COL }}>onda coseno</strong>. Por eso van desfasadas 90°: cuando una vale 1, la otra vale 0.
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="seno" value={fmtNum2(t.sin)} col={SIN_COL} size={18} />
            <Readout label="coseno" value={fmtNum2(t.cos)} col={COS_COL} size={18} />
            <Readout label="tangente" value={t.tan === null ? "∄" : fmtNum2(t.tan)} col={TAN_COL} size={18} />
            <Readout label="θ en radianes" value={fmtNum2(t.rad)} col={accent} size={18} />
          </div>
          <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>VALORES EXACTOS EN θ = {fmtDeg(t.deg)}</span>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 4 }}>
              sen = {senStr} · cos = {cosStr} · tan = {tanStr}
            </div>
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{d.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{d.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((d, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Cálculo <strong>exacto</strong>: el seno, el coseno y la tangente salen directamente de las coordenadas del punto en el círculo de radio 1; en los ángulos notables se muestran sus valores cerrados (√3/2, √2/2, π/6…). La escena usa unidades de pantalla para encuadrar las ondas, pero los <strong>valores numéricos</strong> de las lecturas siempre son reales.
        </span>
      </div>

      {/* ── Objetivos ─────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
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

      {/* ── Reto de cálculo en vivo: predice sen θ (estrellas + récord) ───── */}
      <PrediccionTrigCard
        accent={accent}
        degLive={t.deg}
        sinLive={t.sin}
        mejor={mejorEstrellas}
        onResultado={registraEstrellas}
        playSfx={
          sonido
            ? (ok) => {
                if (ok) audioRef.current?.correcto();
                else audioRef.current?.incorrecto();
              }
            : undefined
        }
      />

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────────── */}
      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
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

      {/* ── Cajón de teoría ───────────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={CIRCULO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Fila de una razón trigonométrica ────────────────────────────────────── */
function RazonRow({ label, valor, col, icon }: { label: string; valor: string; col: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${col}33` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: T.text2 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 16, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
    </div>
  );
}

/* ── Reto de cálculo en vivo: predecir sen θ ─────────────────────────────── */
function PrediccionTrigCard({
  accent, degLive, sinLive, mejor, onResultado, playSfx,
}: {
  accent: string;
  degLive: number;
  sinLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ deg: number; sin: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [estrellas, setEstrellas] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const tomarLectura = () => {
    setSnap({ deg: degLive, sin: sinLive });
    setVal("");
    setIntentos(0);
    setEstrellas(null);
    setMsg(null);
  };

  const comprobar = () => {
    if (!snap) return;
    const num = Number(val.replace(",", "."));
    if (val.trim() === "" || Number.isNaN(num)) {
      setMsg("Escribe tu valor de sen θ (por ejemplo 0.5 o −0.87).");
      return;
    }
    const n = intentos + 1;
    setIntentos(n);
    const ok = Math.abs(num - snap.sin) <= 0.04;
    if (ok) {
      const est = n <= 1 ? 3 : n === 2 ? 2 : 1;
      setEstrellas(est);
      setMsg(null);
      onResultado(est);
      playSfx?.(true);
    } else {
      const cerca = Math.abs(num - snap.sin) <= 0.12;
      setMsg(cerca ? "Muy cerca. Revisa el redondeo y vuelve a intentar." : "Aún no. Recuerda: sen θ es la ALTURA del punto (y su signo depende del cuadrante).");
      playSfx?.(false);
    }
  };

  return (
    <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22, border: `1px solid ${accent}55` }}>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto de cálculo: predice sen θ
      </Eyebrow>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        {[1, 2, 3].map((s) => (
          <i key={s} className="fa-solid fa-star" style={{ fontSize: 15, color: (estrellas ?? 0) >= s ? "#fbbf24" : "rgba(255,255,255,0.18)" }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 11.5, color: T.text3, fontWeight: 700 }}>Mejor: {mejor}★</span>
      </div>

      {!snap ? (
        <>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
            Coloca el punto P en un ángulo (arrástralo, usa el deslizador o aplica un ángulo notable) y captura la lectura. Luego tú calculas <strong style={{ color: "#fff" }}>sen θ</strong> con tu transportador y tu calculadora —sin mirar la lectura del seno— y lo verificas.
          </div>
          <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
            <i className="fa-solid fa-camera" style={{ marginRight: 8 }} /> Capturar el ángulo actual (θ = {fmtDeg(degLive)})
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: T.inset, border: `1px solid ${T.line}`, marginBottom: 14 }}>
            <i className="fa-solid fa-compass" style={{ fontSize: 18, color: accent }} />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>ÁNGULO CAPTURADO</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: "#fff" }}>θ = {fmtDeg(snap.deg)}</div>
            </div>
            <button className="calc-btn calc-btn-ghost" style={{ marginLeft: "auto", padding: "8px 12px", fontSize: 12 }} onClick={tomarLectura}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} /> Otro ángulo
            </button>
          </div>

          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginBottom: 10 }}>
            ¿Cuánto vale <strong style={{ color: SIN_COL }}>sen {fmtDeg(snap.deg)}</strong>? Escribe tu resultado (2 decimales; usa signo negativo si el punto está debajo del eje).
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="calc-in"
              style={{ flex: "1 1 160px" }}
              inputMode="decimal"
              placeholder="sen θ = …"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
              disabled={estrellas !== null}
            />
            <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={estrellas !== null || val.trim() === ""}>
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} /> Verificar
            </button>
          </div>

          {msg && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: WARN, lineHeight: 1.45, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
              <span>{msg}</span>
            </div>
          )}

          {estrellas !== null && (
            <div style={{ marginTop: 14, padding: "13px 15px", borderRadius: 12, background: `${OK}14`, border: `1px solid ${OK}55` }}>
              <div style={{ fontSize: 13.5, fontWeight: 900, color: OK }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} /> ¡Correcto!
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>
                sen {fmtDeg(snap.deg)} = <strong style={{ ...NUM, color: "#fff" }}>{fmtNum2(snap.sin)}</strong>. Es la altura (coordenada y) del punto en el círculo de radio 1. Captura otro ángulo para seguir practicando.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  const fill = `${((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}

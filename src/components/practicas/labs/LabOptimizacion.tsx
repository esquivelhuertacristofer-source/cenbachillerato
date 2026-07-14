"use client";

/**
 * Laboratorio 3D — "Optimización con la derivada: la lata de mínimo material".
 * Práctica experimental para PM-V-P07-A2 (ejercicio_matematico "Resolviendo
 * problemas de optimización en contextos reales"; progresión 7, UAC PM-V
 * Cálculo Diferencial).
 *
 * El alumno mueve el radio r de una lata cilíndrica SIN tapa de volumen fijo
 * V = 1000 cm³; la altura h se recalcula sola por la restricción. A la vez ve la
 * curva del material A(r) = πr² + 2000/r y cómo se reparte entre base (πr², crece)
 * y lateral (2000/r, baja). El mínimo está donde A'(r) = 0 (tangente horizontal):
 * r = h ≈ 6.83 cm, A ≈ 439.3 cm². Todos los valores son de cálculo cerrado.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { OPTIMIZACION_FICHA } from "./optimizacion-cilindro-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./optimizacion-cilindro-data";
import { LabSfx } from "./lab-audio";
import {
  R_OPT, A_OPT, R_MIN, R_MAX,
  hDeR, areaBase, areaLateral, areaTotal, dArea,
  PASOS, IDEAS, DATOS, fmt0, fmt1, fmt2, fmt3,
} from "./optimizacion-data";

const OptimizacionScene = dynamic(() => import("./OptimizacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wine-bottle fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Construyendo la lata…</span>
    </div>
  ),
});

const TOTAL_COL = "#2DD4BF";  // material total A(r)
const BASE_COL = "#fbbf24";   // base πr²
const LAT_COL = "#C084FC";    // lateral 2000/r
const OPT_COL = "#34D399";    // óptimo / tangente horizontal
const R_COL = "#7dd3fc";      // sonda r
const WARN = "#FF8A3C";

import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-cilindro-reto";

/** Instrumentos de diseño/medición de un envase (3 correctos + 3 distractores). */
const INSTRUMENTOS: EppItem[] = [
  { key: "vernier", nombre: "Calibrador Vernier", icono: "fa-ruler-combined", ok: true, nota: "Mide con precisión el radio r de la lata (décimas de mm)." },
  { key: "flexometro", nombre: "Flexómetro", icono: "fa-ruler-vertical", ok: true, nota: "Mide la altura h del envase sobre la mesa." },
  { key: "calculadora", nombre: "Calculadora científica", icono: "fa-calculator", ok: true, nota: "Evalúa A(r) = πr² + 2000/r y su derivada A'(r)." },
  { key: "termometro", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no interviene en optimizar el material." },
  { key: "cronometro", nombre: "Cronómetro", icono: "fa-stopwatch", ok: false, nota: "Mide tiempo; aquí no hay movimiento que cronometrar." },
  { key: "brujula", nombre: "Brújula", icono: "fa-compass", ok: false, nota: "Da orientación; no mide ni radio ni altura ni material." },
];

export function LabOptimizacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [rPos, setRPos] = useState<number>(R_MIN + 1); // arranca alto-delgado
  const [showDecomp, setShowDecomp] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // pilares de robustecimiento: equiparse, arrastrar, predecir/calcular
  const [eppListo, setEppListo] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const [mejorEstrellas, setMejorEstrellas] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const v = window.localStorage.getItem(RETO_KEY);
      return v ? Number(v) || 0 : 0;
    } catch {
      return 0;
    }
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

  // Animación: la sonda r barre el rango de ida y vuelta.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const span = R_MAX - R_MIN;
      setRPos((prev) => {
        let next = prev + dir * dt * span * 0.22;
        if (next <= R_MIN) { next = R_MIN; dir = 1; }
        else if (next >= R_MAX) { next = R_MAX; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const irAlOptimo = () => { setPlaying(false); setRPos(R_OPT); bump(); if (sonido) audioRef.current?.blip(); };
  const reset = () => {
    setPlaying(false);
    setRPos(R_MIN + 1);
    setShowDecomp(true);
    bump();
  };

  // arrastre de la sonda r sobre el plano de costo (pilar ARRASTRAR)
  const onArrastraR = useCallback((r: number) => {
    setPlaying(false);
    setArrastro(true);
    setRPos(r);
  }, []);
  const onGrabR = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);
  const registraEstrellas = useCallback((estrellas: number) => {
    setPredicho(true);
    setMejorEstrellas((prev) => {
      const mejor = Math.max(prev, estrellas);
      try { window.localStorage.setItem(RETO_KEY, String(mejor)); } catch { /* sin persistencia */ }
      return mejor;
    });
    void guardarEstrellas(RETO_KEY, estrellas);
  }, []);

  // valores en vivo
  const h = hDeR(rPos);
  const aB = areaBase(rPos);
  const aL = areaLateral(rPos);
  const aT = areaTotal(rPos);
  const d1 = dArea(rPos);
  const vol = Math.PI * rPos * rPos * h; // = 1000 (verificación viva)
  const cercaOptimo = Math.abs(rPos - R_OPT) < 0.12;

  let lecturaDeriv = "A'(r) ≈ 0: la tangente es casi horizontal — estás en el óptimo, el material no baja más.";
  if (d1 < -1e-6) lecturaDeriv = `A'(${fmt2(rPos)}) = ${fmt1(d1)} < 0 → el material AÚN BAJA si agrandas r (ensancha y baja).`;
  else if (d1 > 1e-6) lecturaDeriv = `A'(${fmt2(rPos)}) = ${fmt1(d1)} > 0 → el material YA SUBE: te pasaste del óptimo.`;

  const explorado = rPos !== R_MIN + 1;

  const pasos = [
    { n: 1, txt: "Equípate con tus instrumentos de medición", done: eppListo },
    { n: 2, txt: "Arrastra el radio r sobre el plano de costo", done: arrastro },
    { n: 3, txt: "Explora de delgada a ancha y halla el mínimo", done: cercaOptimo },
    { n: 4, txt: "Predice y calcula el material A(r)", done: predicho },
  ];
  const pasoActivo = pasos.findIndex((p) => !p.done);

  const objetivos = [
    { txt: "Equípate con los instrumentos de medición correctos", done: eppListo },
    { txt: "Arrastra la sonda del radio r sobre el plano de costo", done: arrastro },
    { txt: "Mueve r y observa cómo cambia el material A(r)", done: explorado },
    { txt: "Identifica el mínimo donde A'(r) = 0 (tangente horizontal)", done: cercaOptimo },
    { txt: "Predice el material A(r) en un instante y gana estrellas", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wine-bottle" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>A(r) = πr² + 2000/r</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con V = 1000 cm³ fijo, A&apos;(r) = 0 da r³ = 1000/π, así que r = h ≈ 6.83 cm y el material mínimo es A ≈ 439.3 cm².
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes opPulse { 0%,100%{ box-shadow:0 0 0 0 var(--opc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .op-live-dot { animation: opPulse 1.6s ease-in-out infinite; }
        .op-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .op-grid { grid-template-columns: 1fr; } }
        .op-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .op-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .op-icobtn:hover { background:rgba(255,255,255,0.12); }
        .op-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--opc) 0%, var(--opc) var(--opfill), rgba(255,255,255,0.12) var(--opfill), rgba(255,255,255,0.12) 100%); }
        .op-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--opc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .op-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--opc); cursor:pointer; }
        .op-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:7px; }
        .op-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .op-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .op-toggle { cursor:pointer; padding:7px 11px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text3}; font-size:12px; font-weight:800; transition:all .15s; display:flex; align-items:center; gap:7px; }
        @media (max-width: 1000px){ .op-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .op-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .op-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .op-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .op-drawer[data-open="true"] { transform:translateX(0); }
        .op-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .op-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .op-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .op-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .op-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .op-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }

        /* Banda de pasos guiados */
        .op-steps { display:flex; gap:10px; flex-wrap:wrap; }
        .op-step { flex:1 1 180px; display:flex; align-items:center; gap:10px; padding:11px 13px; border-radius:13px;
          border:1px solid ${T.line}; background:${T.glass}; transition:all .16s; }
        .op-step[data-state="active"] { border-color:${accent}; background:rgba(${color.rgba},0.12); box-shadow:0 0 0 1px ${accent}55 inset; }
        .op-step[data-state="done"] { border-color:${OK}66; background:${OK}14; }
        .op-step-n { width:26px; height:26px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; color:#04121f; background:rgba(255,255,255,0.4); }
        .op-step[data-state="active"] .op-step-n { background:${accent}; }
        .op-step[data-state="done"] .op-step-n { background:${OK}; }
        .op-step-tx { font-size:12px; font-weight:700; line-height:1.25; color:${T.text2}; }
        .op-step[data-state="active"] .op-step-tx, .op-step[data-state="done"] .op-step-tx { color:#fff; }

        /* Tarjeta de predicción / cálculo */
        .op-calc-in { width:100%; box-sizing:border-box; padding:11px 13px; border-radius:11px; border:1px solid ${T.line};
          background:rgba(4,10,22,0.5); color:#fff; font-size:15px; outline:none; transition:border-color .15s; }
        .op-calc-in:focus { border-color:${accent}; }
        .op-calc-btn { cursor:pointer; border:none; border-radius:11px; font-size:13.5px; font-weight:800; padding:11px 16px; transition:filter .15s; }
        .op-calc-btn:hover:not(:disabled) { filter:brightness(1.08); }
        .op-calc-btn:disabled { cursor:not-allowed; opacity:0.5; }
        .op-calc-primary { background:${accent}; color:#04121f; }
        .op-calc-ghost { background:transparent; border:1px solid ${T.line}; color:${T.text2}; }
        .op-calc-ghost:hover { border-color:${accent}; color:#fff; }
      `}</style>

      {/* ── Pasos guiados (pilar SEGUIR PASOS) ─────────────────────────────── */}
      <div style={{ ...card, padding: "14px 18px", marginBottom: 18 }}>
        <div className="op-steps">
          {pasos.map((p, i) => (
            <div key={p.n} className="op-step" data-state={p.done ? "done" : i === pasoActivo ? "active" : "todo"}>
              <span className="op-step-n">{p.done ? <i className="fa-solid fa-check" /> : p.n}</span>
              <span className="op-step-tx">{p.txt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="op-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <OptimizacionScene
                rPos={rPos} showDecomp={showDecomp} accent={accent} resetNonce={resetNonce}
                arrastrable={eppListo}
                onScrubR={onArrastraR}
                onGrab={onGrabR}
              />
            </SceneBoundary>

            {/* Compuerta de equipamiento (pilar EQUIPARSE) */}
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Antes de diseñar: equípate"
                subtitulo="Elige tus instrumentos de medición"
                intro="Vas a optimizar el material de una lata sin tapa de 1000 cm³. Para medir el envase y evaluar A(r) necesitas los instrumentos correctos. Selecciona los 3 instrumentos de medición (no los distractores) para entrar al laboratorio."
                verbo="instrumentos de medición"
                onEntrar={() => { setEppListo(true); if (sonido) audioRef.current?.blip(); }}
              />
            )}

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="op-live-dot" style={{ ["--opc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>A(r) = πr² + 2000/r</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="op-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="op-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="op-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Barrer el radio (r)"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="op-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="op-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Leyenda */}
            <div style={{ position: "absolute", top: 60, left: 16, display: "flex", flexDirection: "column", gap: 6, padding: "9px 12px", borderRadius: 12, background: "rgba(4,10,22,0.7)", border: `1px solid ${T.line}`, backdropFilter: "blur(8px)" }}>
              <LegItem col={TOTAL_COL} txt="material A(r)" />
              {showDecomp && <LegItem col={BASE_COL} txt="base  πr²" dashed />}
              {showDecomp && <LegItem col={LAT_COL} txt="lateral  2000/r" dashed />}
              <LegItem col={OPT_COL} txt="mínimo (A' = 0)" />
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                {cercaOptimo ? (
                  <>
                    <i className="fa-solid fa-trophy" style={{ color: OPT_COL, marginRight: 7 }} />
                    Óptimo: r = h ≈ {fmt2(R_OPT)} cm — material mínimo A ≈ {fmt1(A_OPT)} cm².
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-ruler-combined" style={{ color: R_COL, marginRight: 7 }} />
                    {lecturaDeriv}
                  </>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                Con r = {fmt2(rPos)} cm la altura forzada es h = {fmt2(h)} cm (V = π·r²·h = {fmt0(vol)} cm³, fijo). Base πr² = {fmt1(aB)} · lateral 2000/r = {fmt1(aL)}.
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-crosshairs" style={{ marginRight: 8, color: accent }} />
              Mueve el radio r (la altura h se ajusta sola) o salta al óptimo
            </Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <button className="op-chip" data-on={cercaOptimo} onClick={irAlOptimo} title="Lleva r al valor que minimiza el material">
                <i className="fa-solid fa-trophy" style={{ color: OPT_COL }} />
                Saltar al óptimo (r = {fmt2(R_OPT)})
              </button>
              <button className="op-chip" onClick={() => { setPlaying(false); setRPos(R_MIN); bump(); }} title="Lata alta y delgada">
                <i className="fa-solid fa-arrow-up-long" style={{ color: LAT_COL }} />
                Delgada (r = {fmt0(R_MIN)})
              </button>
              <button className="op-chip" onClick={() => { setPlaying(false); setRPos(R_MAX); bump(); }} title="Lata baja y ancha">
                <i className="fa-solid fa-arrows-left-right" style={{ color: BASE_COL }} />
                Ancha (r = {fmt0(R_MAX)})
              </button>
            </div>
            <Deslizador
              label="radio  r (cm)"
              icon="fa-arrows-left-right-to-line"
              colr={R_COL}
              valor={`${fmt2(rPos)} cm`}
              min={R_MIN} max={R_MAX} step={0.02} value={rPos}
              onChange={(v) => { setPlaying(false); setRPos(v); }}
              hintL={`${fmt0(R_MIN)} cm`} hintR={`${fmt0(R_MAX)} cm`}
            />
            <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
              <button className="op-toggle" style={showDecomp ? { borderColor: `${BASE_COL}88`, background: `${BASE_COL}1e`, color: "#fff" } : undefined} onClick={() => setShowDecomp((s) => !s)}>
                <i className={`fa-solid ${showDecomp ? "fa-eye" : "fa-eye-slash"}`} style={{ color: BASE_COL }} />
                Descomponer base + lateral
              </button>
            </div>
            <div style={{ marginTop: 12, fontSize: 11.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <i className="fa-solid fa-hand-pointer" style={{ color: accent, marginTop: 2 }} />
              <span>También puedes <strong style={{ color: "#fff" }}>arrastrar la sonda del radio r</strong> (la esfera azul sobre el eje r) directamente en el plano de costo 3D: el material A(r) y la tangente se recalculan en vivo.</span>
            </div>
          </div>

          {/* El reparto del material en r actual */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              El reparto del material en r = {fmt2(rPos)} cm
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <MiniVal label="base  πr²" value={`${fmt1(aB)} cm²`} col={BASE_COL} />
              <MiniVal label="lateral  2000/r" value={`${fmt1(aL)} cm²`} col={LAT_COL} />
              <MiniVal label="total  A(r)" value={`${fmt1(aT)} cm²`} col={TOTAL_COL} />
            </div>
            <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 12, border: `1px solid ${OPT_COL}55`, background: `${OPT_COL}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
              <i className="fa-solid fa-bolt" style={{ color: OPT_COL, marginRight: 8 }} />
              La pendiente del material es <strong style={{ color: R_COL, fontFamily: "ui-monospace, monospace" }}>A&apos;({fmt2(rPos)}) = {fmt2(d1)}</strong>. El mínimo está donde <strong style={{ color: OPT_COL }}>A&apos;(r) = 0</strong>: ahí lo que gana la base iguala lo que pierde la pared.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El modelo */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${TOTAL_COL}66`, background: `${TOTAL_COL}12` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: TOTAL_COL }}>
                <i className="fa-solid fa-wine-bottle" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El modelo de la lata sin tapa</div>
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              <ExprRow col={TOTAL_COL} txt="V = π r² h = 1000  (restricción)" />
              <ExprRow col={BASE_COL} txt="h = 1000 / (π r²)" />
              <ExprRow col={LAT_COL} txt="A(r) = π r² + 2000 / r" />
              <ExprRow col={R_COL} txt="A'(r) = 2π r − 2000 / r²" />
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${OPT_COL}44` }}>
                <i className="fa-solid fa-trophy" style={{ color: OPT_COL, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>Óptimo: r = h ≈ {fmt2(R_OPT)} cm</div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>A&apos;(r) = 0 → r³ = 1000/π. Material mínimo A = 3πr² ≈ {fmt1(A_OPT)} cm².</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${LAT_COL}44` }}>
                <i className="fa-solid fa-circle-info" style={{ color: LAT_COL, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>Sin tapa → h = r</div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>En un cilindro cerrado (con dos tapas) el óptimo sería h = 2r.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resolución paso a paso (verbatim A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Optimización — paso a paso
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {PASOS.map((p) => (
                <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="op-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="radio r" value={`${fmt2(rPos)}`} col={R_COL} size={15} />
            <Readout label="altura h" value={`${fmt2(h)}`} col={LAT_COL} size={15} />
            <Readout label="volumen V" value={`${fmt0(vol)}`} col={OPT_COL} size={15} />
            <Readout label="material A" value={`${fmt1(aT)}`} col={TOTAL_COL} size={15} />
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
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
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Cálculo <strong>exacto</strong>: el problema (lata SIN tapa, V = 1000 cm³) es verbatim del enunciado A2, y el óptimo es <strong>simbólico cerrado</strong>: A&apos;(r) = 0 ⇒ r = (1000/π)<sup>1/3</sup> ≈ {fmt3(R_OPT)} cm, h = r y A = 3πr² ≈ {fmt1(A_OPT)} cm². En el cilindro sin tapa el óptimo cumple <strong>h = r</strong> (el cerrado da h = 2r). La lata 3D usa una escala fija para que quepa en el recuadro y se ve girando para apreciar la base abierta; las medidas en cm son las reales.
        </span>
      </div>

      {/* ── Objetivos ──────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#4ADE80" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto de predicción: calcula el material (estrellas + récord) ───── */}
      <PrediccionMaterialCard
        accent={accent}
        rLive={rPos}
        aLive={aT}
        dLive={d1}
        mejor={mejorEstrellas}
        onResultado={registraEstrellas}
        playSfx={
          sonido
            ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); }
            : undefined
        }
      />

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ─────────────── */}
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

      {/* ── Cajón de teoría ──────────────────────────────────────────────── */}
      <div className="op-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="op-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="op-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="op-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="op-drawer-body">
          <FichaTeorica data={OPTIMIZACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Reto de predicción: calcula el material en un radio ──────────────────────
 * El alumno congela una lectura del radio r y PREDICE el material A(r) antes de
 * verlo. La revisión es numérica (tolerancia 5 cm²); las estrellas premian
 * acertar con pocos intentos y el récord se guarda en localStorage. Es el pilar
 * HACER CÁLCULOS. */
function PrediccionMaterialCard({
  accent, rLive, aLive, dLive, mejor, onResultado, playSfx,
}: {
  accent: string;
  rLive: number;
  aLive: number;
  dLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ r: number; a: number; d: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [estrellas, setEstrellas] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; cerca: boolean; txt: string } | null>(null);

  const tomarLectura = () => {
    setSnap({ r: rLive, a: aLive, d: dLive });
    setVal(""); setIntentos(0); setEstrellas(null); setMsg(null);
  };

  const comprobar = () => {
    if (!snap || estrellas != null) return;
    const num = Number(val.replace(",", "."));
    if (!Number.isFinite(num)) {
      setMsg({ ok: false, cerca: false, txt: "Escribe un número válido (en cm²)." });
      return;
    }
    const next = intentos + 1;
    const dif = Math.abs(num - snap.a);
    if (dif <= 5) {
      const est = next <= 1 ? 3 : next === 2 ? 2 : 1;
      setEstrellas(est);
      setMsg({ ok: true, cerca: false, txt: `¡Correcto! A(${fmt2(snap.r)}) = ${fmt1(snap.a)} cm².` });
      onResultado(est);
      playSfx?.(true);
    } else {
      setIntentos(next);
      const cerca = dif <= 20;
      setMsg({ ok: false, cerca, txt: cerca ? "Muy cerca. Ajusta tu cálculo y vuelve a intentar." : "Aún no. Usa A(r) = πr² + 2000/r con ese radio." });
      playSfx?.(false);
    }
  };

  return (
    <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22, borderColor: `${accent}55` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
          Reto: predice el material
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <i key={i} className="fa-solid fa-star" style={{ fontSize: 14, color: estrellas != null && i < estrellas ? "#FFC94D" : "rgba(255,255,255,0.18)" }} />
            ))}
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text3 }}>Mejor: {mejor}★</span>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, margin: "0 0 14px" }}>
        Arrastra la sonda o mueve el radio hasta un valor que te interese y <strong style={{ color: "#fff" }}>congela la lectura</strong>. Antes de mirar el marcador, calcula tú el material con <strong style={{ color: accent }}>A(r) = πr² + 2000/r</strong>.
      </p>

      {!snap ? (
        <button className="op-calc-btn op-calc-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura del radio
        </button>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 700 }}>radio</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: "#fff" }}>r = {fmt2(snap.r)} cm</div>
            </div>
            <div style={{ padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 700 }}>pendiente</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: snap.d <= 0 ? OPT_COL : WARN }}>A&apos;(r) = {fmt2(snap.d)}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="op-calc-in"
                inputMode="decimal"
                placeholder="A en cm²"
                value={val}
                disabled={estrellas != null}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
                style={{ ...NUM }}
              />
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text2 }}>cm²</span>
            </div>
            <button className="op-calc-btn op-calc-primary" onClick={comprobar} disabled={estrellas != null || val.trim() === ""}>
              <i className="fa-solid fa-check" style={{ marginRight: 7 }} />
              Comprobar
            </button>
            <button className="op-calc-btn op-calc-ghost" onClick={tomarLectura}>
              <i className="fa-solid fa-rotate" style={{ marginRight: 7 }} />
              Otra lectura
            </button>
          </div>

          {msg && (
            <div style={{ marginTop: 13, display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, lineHeight: 1.45, color: msg.ok ? OK : msg.cerca ? WARN : "#f87171" }}>
              <i className={`fa-solid ${msg.ok ? "fa-circle-check" : msg.cerca ? "fa-circle-half-stroke" : "fa-circle-xmark"}`} style={{ marginTop: 1 }} />
              <span>{msg.txt}{!msg.ok && intentos > 0 ? ` (intento ${intentos})` : ""}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Mini valor ───────────────────────────────────────────────────────────── */
function MiniVal({ label, value, col }: { label: string; value: string; col: string }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}33` }}>
      <div style={{ fontSize: 10, color: T.text3, fontWeight: 800, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{value}</div>
    </div>
  );
}

/* ── Fila de expresión ────────────────────────────────────────────────────── */
function ExprRow({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ padding: "9px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}33` }}>
      <div style={{ fontSize: 12.5, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{txt}</div>
    </div>
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt, dashed }: { col: string; txt: string; dashed?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `${dashed ? "2px dashed" : "3px solid"} ${col}`, flexShrink: 0 }} />
      {txt}
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
      <input type="range" className="op-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--opc" as string]: colr, ["--opfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}

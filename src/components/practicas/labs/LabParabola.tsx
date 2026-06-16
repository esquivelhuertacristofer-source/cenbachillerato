"use client";

/**
 * Laboratorio 3D — Parábolas y funciones cuadráticas (tiro parabólico).
 * Práctica experimental para PM-III-P06-A2
 * ("Analizo la trayectoria de un tiro parabólico"; progresión 6).
 *
 * Una función cuadrática h(x) = a·x² + b·x + c se DIBUJA como una parábola, y
 * cada parte del álgebra tiene significado geométrico: el signo de a fija la
 * APERTURA, el VÉRTICE (x = −b/2a) es el punto más alto, los CEROS son donde
 * la curva toca el suelo y el EJE DE SIMETRÍA (x = x_v) la parte en dos mitades
 * espejo. Pensamiento Matemático III — relación álgebra↔geometría (MCCEMS 2025).
 *
 * Robustecido (máxima interactividad): el alumno se EQUIPA con sus instrumentos
 * de medición (EppGate), SIGUE PASOS (stepper guiado), ARRASTRA el vértice del
 * tiro en 3D y la parábola se reconstruye en tiempo real (con a fija, mover el
 * apex fija b = −2a·x_v y c = a·x_v² + h_v), ve la ESTELA de PARTÍCULAS del balón
 * y HACE EL CÁLCULO: predice el vértice con x = −b/2a y gana estrellas (récord local).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { PARABOLA_FICHA } from "./parabola-trayectoria-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./parabola-trayectoria-data";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  DEFAULTS,
  GOL,
  evalH,
  vertice,
  discriminante,
  raices,
  ejeSimetria,
  aterrizaje,
  fmtNum,
  fmtEcuacion,
  A_MIN, A_MAX, A_STEP, B_MIN, B_MAX, B_STEP, C_MIN, C_MAX, C_STEP,
} from "./parabola-data";

const ParabolaScene = dynamic(() => import("./ParabolaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const ROJO = "#ff6b6b";
const WARN = "#FF8A3C";
const RETO_KEY = "cen-parabola-reto";

/** Instrumentos de medición del topógrafo del tiro (3 correctos + 3 distractores). */
const INSTRUMENTOS: EppItem[] = [
  { key: "cinta", nombre: "Cinta métrica", icono: "fa-ruler-horizontal", ok: true, nota: "Mide el alcance y la altura en metros: las coordenadas de la parábola." },
  { key: "transportador", nombre: "Transportador", icono: "fa-draw-polygon", ok: true, nota: "Mide el ángulo de salida del balón, ligado a la inclinación b." },
  { key: "cronometro", nombre: "Cronómetro", icono: "fa-stopwatch", ok: true, nota: "Registra el tiempo de vuelo para relacionarlo con la trayectoria." },
  { key: "balon", nombre: "Balón", icono: "fa-futbol", ok: false, nota: "Es el objeto que estudias, no un instrumento de medición." },
  { key: "bandera", nombre: "Bandera de córner", icono: "fa-flag", ok: false, nota: "Marca la cancha, pero no mide nada." },
  { key: "tacos", nombre: "Tacos", icono: "fa-shoe-prints", ok: false, nota: "Calzado del jugador: no sirve para medir la parábola." },
];

export function LabParabola({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [showGol, setShowGol] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

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

  // objetivos / pasos
  const [movioA, setMovioA] = useState(false);
  const [movioBC, setMovioBC] = useState(false);
  const [vioGol, setVioGol] = useState(true);
  const [arrastro, setArrastro] = useState(false); // arrastró el vértice en 3D
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo del vértice

  // récord de estrellas del reto de cálculo (persistido)
  const [mejorEstrellas, setMejorEstrellas] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(window.localStorage.getItem(RETO_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  const bump = () => setResetNonce((n) => n + 1);

  // a nunca puede ser 0 (dejaría de ser parábola).
  const cambiarA = (v: number) => {
    if (v === 0) v = a < 0 ? -A_STEP : A_STEP;
    setA(v);
    setMovioA(true);
  };
  const cambiarB = (v: number) => { setB(v); setMovioBC(true); if (sonido) audioRef.current?.blip(); };
  const cambiarC = (v: number) => { setC(v); setMovioBC(true); if (sonido) audioRef.current?.blip(); };
  const toggleGol = () => { setShowGol((g) => !g); setVioGol(true); if (sonido) audioRef.current?.blip(); };

  // el vértice arrastrado en 3D entra por aquí (a fija → b y c nuevos)
  const onVerticeArrastre = useCallback((nb: number, nc: number) => {
    setArrastro(true);
    setMovioBC(true);
    setB(nb);
    setC(nc);
  }, []);
  const onGrabVertice = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);

  const reset = () => {
    setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c);
    setShowGol(true);
    bump();
  };

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    setMejorEstrellas((prev) => {
      const mejor = Math.max(prev, est);
      try { window.localStorage.setItem(RETO_KEY, String(mejor)); } catch { /* ignore */ }
      return mejor;
    });
  }, []);

  // magnitudes matemáticas (deterministas)
  const vert = useMemo(() => vertice(a, b, c), [a, b, c]);
  const D = useMemo(() => discriminante(a, b, c), [a, b, c]);
  const rs = useMemo(() => raices(a, b, c), [a, b, c]);
  const eje = useMemo(() => ejeSimetria(a, b), [a, b]);
  const land = useMemo(() => aterrizaje(a, b, c), [a, b, c]);
  const ecuacion = useMemo(() => fmtEcuacion(a, b, c), [a, b, c]);

  const hPorteria = useMemo(() => evalH(a, b, c, GOL.porteriaX), [a, b, c]);
  const balonSupera = hPorteria > GOL.travesano;
  // ¿el balón sigue en el aire al llegar a la portería? (la parábola no ha caído)
  const enAire = hPorteria > 0 && (land === 0 || GOL.porteriaX <= land);

  const cerosTxt =
    rs.length === 0 ? "no toca el suelo" :
    rs.length === 1 ? `x = ${fmtNum(rs[0]!, 1)}` :
    `x = ${fmtNum(rs[0]!, 1)} y x = ${fmtNum(rs[1]!, 1)}`;

  // pasos guiados (pilar: seguir pasos)
  const pasos = [
    { t: "Equípate", icon: "fa-ruler-combined", done: eppListo },
    { t: "Da forma al tiro (a, b, c)", icon: "fa-sliders", done: movioA || movioBC },
    { t: "Arrastra el vértice del tiro", icon: "fa-hand-pointer", done: arrastro },
    { t: "Calcula el vértice (x = −b/2a)", icon: "fa-calculator", done: predicho },
  ];
  const pasoActivo = pasos.findIndex((p) => !p.done);

  const objetivos = [
    { txt: "Cambia la apertura moviendo a", done: movioA },
    { txt: "Mueve b y c y observa el desplazamiento", done: movioBC },
    { txt: "Arrastra el vértice del tiro en 3D", done: arrastro },
    { txt: "Pon a prueba el escenario del gol", done: vioGol },
    { txt: "Calcula el vértice con x = −b/2a", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Una cuadrática se dibuja como una parábola</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: h(x) = a·x² + b·x + c traza una parábola con un vértice, dos ceros y un eje de simetría. El signo de a decide hacia dónde abre.
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
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-golbtn { cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:9px;
          padding:12px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2};
          font-size:13px; font-weight:800; transition:all .15s; }
        .ex-golbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-golbtn[data-on="true"] { border-color:var(--exc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--exc); }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

        /* Pasos guiados */
        .ex-steps { display:flex; gap:8px; flex-wrap:wrap; }
        .ex-step { flex:1 1 0; min-width:130px; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;
          border:1px solid ${T.line}; background:${T.inset}; transition:all .18s; }
        .ex-step[data-state="done"] { border-color:${OK}66; background:${OK}12; }
        .ex-step[data-state="active"] { border-color:${accent}; background:rgba(${color.rgba},0.14); box-shadow:0 0 0 1px ${accent}55; }
        .ex-step-n { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; }

        /* Entrada de cálculo */
        .calc-in { width:100%; box-sizing:border-box; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:18px; font-weight:900; text-align:center; padding:12px; outline:none; transition:border-color .15s; -moz-appearance:textfield; }
        .calc-in:focus { border-color:${accent}; }
        .calc-in::-webkit-outer-spin-button, .calc-in::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        .calc-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:12px 18px; transition:all .15s; }
        .calc-btn-primary { background:${accent}; color:#04121f; }
        .calc-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .calc-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .calc-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
        .calc-btn-ghost:hover { border-color:${accent}; }

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
      `}</style>

      {/* ── Pasos guiados ──────────────────────────────────────────── */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 16 }}>
        <div className="ex-steps">
          {pasos.map((p, i) => {
            const state = p.done ? "done" : i === pasoActivo ? "active" : "pending";
            return (
              <div key={i} className="ex-step" data-state={state}>
                <span className="ex-step-n" style={{ background: p.done ? OK : i === pasoActivo ? accent : T.glass, color: p.done || i === pasoActivo ? "#04121f" : T.text3 }}>
                  {p.done ? <i className="fa-solid fa-check" /> : <i className={`fa-solid ${p.icon}`} />}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: p.done ? OK : i === pasoActivo ? "#fff" : T.text2, lineHeight: 1.2 }}>{p.t}</span>
              </div>
            );
          })}
        </div>
      </div>

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
              <ParabolaScene
                a={a}
                b={b}
                c={c}
                showGol={showGol}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onVerticeChange={onVerticeArrastre}
                onGrab={onGrabVertice}
              />
            </SceneBoundary>

            {/* Compuerta de equipamiento */}
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Antes de medir: equípate"
                subtitulo="Identifica tus instrumentos de medición"
                verbo="instrumentos de medición"
                intro="Para estudiar el tiro hay que medirlo. Entre el material de abajo, selecciona solo los 3 instrumentos de medición (no el balón ni el equipo del jugador) para entrar."
                onEntrar={() => setEppListo(true)}
              />
            )}

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, ...NUM }}>
                <i className="fa-solid fa-chart-line" style={{ marginRight: 8 }} />
                {ecuacion}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
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

            {/* Pie: lectura de partes */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 600 }}>
                <strong style={{ color: ORO }}>Vértice</strong> en ({fmtNum(vert.x, 1)}, {fmtNum(vert.h, 1)}) · <strong style={{ color: VERDE }}>ceros</strong> {cerosTxt} · <strong style={{ color: "#7fd4ff" }}>eje</strong> x = {fmtNum(eje, 1)}
              </div>
            </div>
          </div>

          {/* Controles: coeficientes */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Mueve los coeficientes de h(x) = a·x² + b·x + c
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Deslizador label="Apertura (a)" icon="fa-a" colr={accent}
                valor={fmtNum(a, 2)} min={A_MIN} max={A_MAX} step={A_STEP} value={a} onChange={cambiarA}
                hintL="más negativo: arco cerrado" hintR="cerca de 0: arco abierto" />
              <Deslizador label="Inclinación de salida (b)" icon="fa-b" colr={"#7fb0e0"}
                valor={fmtNum(b, 1)} min={B_MIN} max={B_MAX} step={B_STEP} value={b} onChange={cambiarB}
                hintL="sube el alcance y la altura" />
              <Deslizador label="Altura inicial (c)" icon="fa-arrow-up-from-ground-water" colr={ORO}
                valor={`${fmtNum(c, 1)} m`} min={C_MIN} max={C_MAX} step={C_STEP} value={c} onChange={cambiarC}
                hintL="desde dónde sale el balón" />
            </div>

            <div style={{ marginTop: 12, fontSize: 11.5, color: T.text3, textAlign: "center", lineHeight: 1.4 }}>
              <i className="fa-solid fa-hand-pointer" style={{ marginRight: 6, color: accent }} />
              o <strong style={{ color: T.text2 }}>arrastra el vértice</strong> (el punto dorado) directamente en la escena: la parábola se reconstruye sola (a se mantiene).
            </div>

            <div style={{ marginTop: 14 }}>
              <button className="ex-golbtn" data-on={showGol} onClick={toggleGol} style={{ ["--exc" as string]: accent }}>
                <i className="fa-solid fa-futbol" style={{ fontSize: 16, color: showGol ? accent : T.text3 }} />
                {showGol ? "Ocultar portería del problema" : "Mostrar el escenario del gol"}
              </button>
            </div>
          </div>

          {/* Reto de cálculo: predice el vértice (pilar: hacer cálculos) */}
          <PrediccionVerticeCard
            accent={accent}
            aLive={a}
            bLive={b}
            cLive={c}
            mejor={mejorEstrellas}
            onResultado={registraEstrellas}
            playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
          />

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-square-root-variable" style={{ marginRight: 8, color: accent }} />
              Las partes de la parábola
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label="Altura máxima" value={fmtNum(vert.h, 2)} unit="m" col={ORO} size={16} />
              <Readout label="Alcance (x_v)" value={fmtNum(vert.x, 2)} unit="m" col={accent} size={16} />
              <Readout label="Eje de simetría" value={`x = ${fmtNum(eje, 2)}`} col={"#7fd4ff"} size={15} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Discriminante b²−4ac" value={fmtNum(D, 2)} col={D >= 0 ? VERDE : ROJO} size={15} />
              <Readout label={rs.length > 1 ? "Ceros (toca el suelo)" : "Ceros"} value={cerosTxt} col={VERDE} size={14} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              Como <strong style={{ color: accent }}>a = {fmtNum(a, 2)}</strong> es negativo, la parábola <strong>abre hacia abajo</strong>: el vértice es el punto <strong style={{ color: ORO }}>más alto</strong>. El discriminante <strong style={{ color: D >= 0 ? VERDE : ROJO }}>{D >= 0 ? "≥ 0" : "< 0"}</strong> indica que {D > 0 ? "cruza el eje X en dos puntos" : D === 0 ? "lo toca en un punto" : "no toca el suelo en este tramo"}.
            </div>

            {/* Escenario del gol — comparación honesta de alturas */}
            {showGol && (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)` }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 7 }}>
                  <i className="fa-solid fa-futbol" style={{ marginRight: 7, color: accent }} />
                  El balón en la portería (x = {GOL.porteriaX} m)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 9 }}>
                  <Readout label="Altura del balón h(25)" value={fmtNum(hPorteria, 2)} unit="m" col={ORO} size={15} />
                  <Readout label="Travesaño" value={fmtNum(GOL.travesano, 2)} unit="m" col={"#9fb2c8"} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  {enAire ? (
                    <>Comparación: <strong style={{ color: balonSupera ? ROJO : VERDE, ...NUM }}>{fmtNum(hPorteria, 2)} m {balonSupera ? ">" : "≤"} {fmtNum(GOL.travesano, 2)} m</strong>. {balonSupera
                      ? "El balón pasa por ENCIMA del travesaño: con esta trayectoria sale por arriba del arco."
                      : "El balón pasa por DEBAJO del travesaño: a esta altura entra dentro del marco."}</>
                  ) : (
                    <>Con estos coeficientes el balón ya tocó el suelo antes de los {GOL.porteriaX} m (alcance {fmtNum(land, 1)} m): no llega a la portería.</>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 6 }}>
                  La actividad usa este modelo para comparar h(25) con la altura del travesaño; ajusta a, b y c para ver cuándo el balón pasa por encima o por debajo.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Del álgebra a la geometría</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La ecuación <strong style={{ color: T.text }}>h(x) = a·x² + b·x + c</strong> y la <strong style={{ color: accent }}>parábola</strong> son lo mismo visto de dos formas. Cada número del álgebra tiene un significado en el dibujo: por eso resolver la ecuación es <em>leer</em> la curva.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Las cuatro partes</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={accent} icon="fa-up-down" titulo="Apertura (signo de a)">
              a &lt; 0 abre hacia abajo (un tiro); a &gt; 0 hacia arriba. Cuanto mayor |a|, más cerrada la curva.
            </Parte>
            <Parte col={ORO} icon="fa-mountain" titulo="Vértice x = −b/2a">
              El punto más alto (o más bajo). Aquí está la altura máxima del balón.
            </Parte>
            <Parte col={VERDE} icon="fa-down-long" titulo="Ceros (raíces)">
              Donde la parábola cruza el eje X: el balón toca el suelo. Se obtienen con la fórmula general.
            </Parte>
            <Parte col={"#7fd4ff"} icon="fa-arrows-up-to-line" titulo="Eje de simetría x = x_v">
              La recta vertical que parte la parábola en dos mitades espejo.
            </Parte>
          </div>

          <div className="ex-divider" />

          <Eyebrow>El discriminante</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            <strong style={{ color: T.text }}>D = b² − 4ac</strong> dice <strong>cuántos ceros</strong> tiene la parábola sin resolverla:
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
              <span><strong style={{ color: VERDE }}>D &gt; 0</strong> → dos ceros (cruza el suelo dos veces)</span>
              <span><strong style={{ color: ORO }}>D = 0</strong> → un cero (apenas lo toca)</span>
              <span><strong style={{ color: ROJO }}>D &lt; 0</strong> → ningún cero real (no lo toca)</span>
            </div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La parábola modela <strong>todo lo que sube y cae</strong>: un tiro libre de la Selección, el chorro de una fuente en el Zócalo, la trayectoria de un cohete, o el cable de un puente. También aparece en las <strong>antenas parabólicas</strong> y en los faros, porque concentran las señales en el foco.
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Empieza con el balón por defecto <strong style={{ color: accent }}>h(x) = −0.04x² + 1.2x</strong>: vértice en <strong style={{ color: ORO }}>(15, 9)</strong> y ceros en <strong style={{ color: VERDE }}>0 y 30</strong>. Luego sube <strong>b</strong> para llegar más lejos, o acerca <strong>a</strong> a cero para abrir el arco.
          </span>
        </div>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
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

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
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
          <FichaTeorica data={PARABOLA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, ...NUM }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: `${((value - min) / (max - min)) * 100}%` }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
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

/* ── Reto de cálculo: predice el vértice con x = −b/2a ─────────────────── */
function PrediccionVerticeCard({
  accent,
  aLive,
  bLive,
  cLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  aLive: number;
  bLive: number;
  cLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ a: number; b: number; c: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap({ a: aLive, b: bLive, c: cLive });
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const xvEsp = snap ? -snap.b / (2 * snap.a) : 0;
  const hvEsp = snap ? evalH(snap.a, snap.b, snap.c, xvEsp) : 0;
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - xvEsp) <= Math.max(0.5, Math.abs(xvEsp) * 0.04);

  const comprobar = () => {
    if (!snap) return;
    const intentoN = intentos + 1;
    setIntentos(intentoN);
    setCheck(true);
    if (okActual) {
      const est = intentoN <= 1 ? 3 : intentoN === 2 ? 2 : 1;
      setEstrellas(est);
      onResultado(est);
    }
    playSfx?.(okActual);
  };

  return (
    <div style={{ ...card, padding: "22px 24px 24px" }}>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto de cálculo · Predice el vértice
      </Eyebrow>

      <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura de los coeficientes actuales y calcula la coordenada x del vértice (el alcance del punto más alto) con{" "}
        <strong style={{ color: accent, ...NUM }}>x = −b / (2·a)</strong>. Compruébalo contra la lectura de la escena.
      </div>

      {!snap ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura de los coeficientes
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Snap label="a" value={fmtNum(snap.a, 2)} col={accent} />
            <Snap label="b" value={fmtNum(snap.b, 1)} col={"#7fb0e0"} />
            <Snap label="c" value={`${fmtNum(snap.c, 1)} m`} col={ORO} />
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuál es x del vértice? (m)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: 320 }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="m"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text2 }}>m</span>
            {check && <i className={`fa-solid ${okActual ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: okActual ? OK : WARN, fontSize: 17 }} />}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            {!(check && okActual) && (
              <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={val.trim() === ""}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
                Comprobar
              </button>
            )}
            <button className="calc-btn calc-btn-ghost" onClick={tomarLectura}>
              <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
              Otra lectura
            </button>
            {estrellas !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 16, color: s <= estrellas ? "#FBBF24" : "rgba(255,255,255,0.18)" }} />
                  ))}
                </div>
                <span style={{ fontSize: 11.5, color: T.text3 }}>Mejor: <strong style={{ color: mejor >= 3 ? OK : T.text2 }}>{mejor}★</strong></span>
              </div>
            )}
          </div>

          {check && (
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${okActual ? OK : WARN}66`, background: `${okActual ? OK : WARN}14`, padding: "14px 16px", fontSize: 13, color: T.text, lineHeight: 1.5 }}>
              {okActual ? (
                <>
                  <div style={{ fontWeight: 900, color: OK, marginBottom: 6 }}>
                    <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                    ¡Correcto! x = {fmtNum(xvEsp, 1)} m
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    x = −({fmtNum(snap.b, 1)}) / (2 × {fmtNum(snap.a, 2)}) = {fmtNum(xvEsp, 1)} m. Ahí la altura máxima es h = {fmtNum(hvEsp, 1)} m, igual que el punto dorado de la escena.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Sustituye b y a en x = −b / (2·a) (ojo con los signos: a es negativo). Vuelve a intentarlo.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Snap({ label, value, col }: { label: string; value: string; col?: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 78, borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "9px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: col ?? T.text, ...NUM }}>{value}</div>
    </div>
  );
}

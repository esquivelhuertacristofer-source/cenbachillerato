"use client";

/**
 * Laboratorio 3D — Conservación de la energía: el péndulo.
 * Práctica experimental para CNEYT-II-P02-A1
 * ("Transformación, transferencia y conservación de la energía").
 *
 * "La energía no se crea ni se destruye, solo se transforma." Un péndulo lo
 * hace visible: en lo alto toda la energía es POTENCIAL (Ep = m·g·h) y v = 0;
 * en el punto más bajo toda es CINÉTICA (Ec = ½·m·v²) y v es máxima. Sin
 * fricción, Ep + Ec se mantiene constante. Con fricción, parte pasa a CALOR y
 * el péndulo se detiene: la energía cambia de forma, nunca desaparece.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { EppGate } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import { CONSERVACION_ENERGIA_FICHA } from "./conservacion-energia-pendulo-ficha";
import { QUIZ_A2 } from "./conservacion-energia-pendulo-data";
import {
  PLANETAS,
  grados2rad,
  altura,
  energiaTotal,
  velocidadMax,
  periodo,
  fmtNum,
  ANG_MIN, ANG_MAX, ANG_STEP,
  LARGO_MIN, LARGO_MAX, LARGO_STEP,
  MASA_MIN, MASA_MAX, MASA_STEP,
} from "./conservacion-data";

const ConservacionScene = dynamic(() => import("./ConservacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const EP_COL = "#3BA7FF";
const EC_COL = "#FFB13B";
const HEAT_COL = "#FF5A5A";
const WARN = "#FF8A3C";
const RETO_KEY = "cen-conservacion-reto";

export function LabConservacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [planetaKey, setPlanetaKey] = useState("tierra");
  const planeta = useMemo(() => PLANETAS.find((p) => p.key === planetaKey) ?? PLANETAS[0]!, [planetaKey]);

  const [anguloDeg, setAnguloDeg] = useState(45);
  const [largo, setLargo] = useState(1.6);
  const [masa, setMasa] = useState(1.5);
  const [friccion, setFriccion] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

  // objetivos
  const [arrastro, setArrastro] = useState(false); // arrastró la masa en 3D
  const [cambioGravedad, setCambioGravedad] = useState(false);
  const [vioFriccion, setVioFriccion] = useState(false);
  const [pauso, setPauso] = useState(false);
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo de v
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);

  // récord de estrellas del reto de cálculo (persistido)
  const [mejorEstrellas, setMejorEstrellas] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(window.localStorage.getItem(RETO_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  // teoría (cajón deslizable) y sonido
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  // valores estáticos (calculados de los controles, no de la animación)
  const theta0 = grados2rad(anguloDeg);
  const hMax = altura(largo, theta0);
  const eTotal = energiaTotal(masa, planeta.g, largo, theta0);
  const vMax = velocidadMax(planeta.g, largo, theta0);
  const T_periodo = periodo(largo, planeta.g);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarPlaneta = (k: string) => { setPlanetaKey(k); setCambioGravedad(k !== "tierra" ? true : cambioGravedad); bump(); };
  const cambiarAngulo = (v: number) => { setAnguloDeg(v); if (sonido) audioRef.current?.blip(); bump(); };
  const cambiarLargo = (v: number) => { setLargo(v); bump(); };
  const cambiarMasa = (v: number) => { setMasa(v); bump(); };
  const cambiarFriccion = (v: number) => { setFriccion(v); if (v > 0) setVioFriccion(true); };
  const togglePausa = () => { setPausado((p) => { if (!p) setPauso(true); return !p; }); };
  const reset = () => { bump(); };

  // la masa arrastrada en 3D entra por aquí (pilar: manipular)
  const onArrastreAngulo = useCallback((deg: number) => {
    setArrastro(true);
    setAnguloDeg(deg);
    if (sonido) audioRef.current?.blip();
    setResetNonce((n) => n + 1);
  }, [sonido]);

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    setMejorEstrellas((prev) => {
      const mejor = Math.max(prev, est);
      try { window.localStorage.setItem(RETO_KEY, String(mejor)); } catch { /* ignore */ }
      return mejor;
    });
  }, []);

  // pasos guiados (pilar: seguir pasos)
  const pasos = [
    { t: "Equípate", icon: "fa-helmet-safety", done: eppListo },
    { t: "Sube la masa: arrástrala", icon: "fa-hand-pointer", done: arrastro },
    { t: "Activa la fricción y mira el calor", icon: "fa-fire", done: vioFriccion },
    { t: "Calcula la rapidez (v = √2gh)", icon: "fa-calculator", done: predicho },
  ];
  const pasoActivo = pasos.findIndex((p) => !p.done);

  const objetivos = [
    { txt: "Arrastra la masa para soltarla", done: arrastro },
    { txt: "Cambia la gravedad (otro planeta)", done: cambioGravedad },
    { txt: "Activa la fricción y observa el calor", done: vioFriccion },
    { txt: "Pausa para comparar Ep y Ec", done: pauso },
    { txt: "Calcula la rapidez máxima (v = √2gh)", done: predicho },
    { txt: "Resuelve el reto evaluable (A2)", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>Ep + Ec = constante</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: sin fricción la energía solo cambia de forma, su suma se conserva.
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
        .ex-esc { cursor:pointer; text-align:left; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          padding:11px 13px; transition:all .14s ease; display:flex; align-items:center; gap:11px; width:100%; }
        .ex-esc:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-esc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
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
              <ConservacionScene
                anguloDeg={anguloDeg}
                largo={largo}
                masa={masa}
                g={planeta.g}
                friccion={friccion}
                pausado={pausado}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onAnguloChange={onArrastreAngulo}
              />
            </SceneBoundary>

            {/* Compuerta de equipamiento */}
            {!eppListo && (
              <EppGate accent={accent} rgba={color.rgba} onEntrar={() => setEppListo(true)} />
            )}

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>Ep + Ec = E₀</span>
            </div>

            {/* Datos del experimento */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 16, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>
                <i className={`fa-solid ${planeta.icono}`} style={{ marginRight: 7 }} />
                {planeta.nombre} · g = {fmtNum(planeta.g, 2)} m/s² →
              </span>
              <span style={{ color: accent }}>E₀ = {fmtNum(eTotal, 1)} J</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawerOpen} onClick={() => setDrawerOpen(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={!pausado} onClick={togglePausa} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar el péndulo">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* aviso de fricción */}
            {friccion > 0 && (
              <div style={{ position: "absolute", bottom: 56, left: 18, fontSize: 12.5, fontWeight: 700, color: HEAT_COL, background: "rgba(2,12,28,0.8)", padding: "6px 11px", borderRadius: 9, border: `1px solid ${HEAT_COL}55` }}>
                <i className="fa-solid fa-fire" style={{ marginRight: 7 }} />
                Con fricción la energía mecánica se disipa como calor.
              </div>
            )}

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawerOpen(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles del experimento */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Condiciones del experimento
            </Eyebrow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: accent }}>Ángulo inicial</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: accent, ...NUM }}>{anguloDeg}°</span>
                </div>
                <input type="range" className="ex-range" min={ANG_MIN} max={ANG_MAX} step={ANG_STEP} value={anguloDeg}
                  onChange={(e) => cambiarAngulo(Number(e.target.value))}
                  style={{ ["--exc" as string]: accent, ["--exfill" as string]: `${((anguloDeg - ANG_MIN) / (ANG_MAX - ANG_MIN)) * 100}%` }} />
                <div style={{ marginTop: 5, fontSize: 10.5, color: T.text3, textAlign: "center" }}>
                  <i className="fa-solid fa-hand-pointer" style={{ marginRight: 5 }} />
                  o arrastra la masa en la escena
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: EP_COL }}>Largo del hilo</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: EP_COL, ...NUM }}>{fmtNum(largo, 1)} m</span>
                </div>
                <input type="range" className="ex-range" min={LARGO_MIN} max={LARGO_MAX} step={LARGO_STEP} value={largo}
                  onChange={(e) => cambiarLargo(Number(e.target.value))}
                  style={{ ["--exc" as string]: EP_COL, ["--exfill" as string]: `${((largo - LARGO_MIN) / (LARGO_MAX - LARGO_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: EC_COL }}>Masa</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: EC_COL, ...NUM }}>{fmtNum(masa, 1)} kg</span>
                </div>
                <input type="range" className="ex-range" min={MASA_MIN} max={MASA_MAX} step={MASA_STEP} value={masa}
                  onChange={(e) => cambiarMasa(Number(e.target.value))}
                  style={{ ["--exc" as string]: EC_COL, ["--exfill" as string]: `${((masa - MASA_MIN) / (MASA_MAX - MASA_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: HEAT_COL }}>
                    <i className="fa-solid fa-fire" style={{ marginRight: 6 }} />
                    Fricción
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: HEAT_COL, ...NUM }}>{Math.round(friccion * 100)}%</span>
                </div>
                <input type="range" className="ex-range" min={0} max={1} step={0.01} value={friccion}
                  onChange={(e) => cambiarFriccion(Number(e.target.value))}
                  style={{ ["--exc" as string]: HEAT_COL, ["--exfill" as string]: `${friccion * 100}%` }} />
              </div>
            </div>

            {/* lecturas */}
            <div style={{ display: "flex", flexWrap: "wrap", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, overflow: "hidden" }}>
              <div style={{ flex: "1 1 0", minWidth: 96 }}>
                <Readout label="Altura máx." value={fmtNum(hMax, 2)} unit="m" col={accent} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Energía E₀" value={fmtNum(eTotal, 1)} unit="J" col={EP_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Rapidez máx." value={fmtNum(vMax, 2)} unit="m/s" col={EC_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Periodo" value={fmtNum(T_periodo, 2)} unit="s" col={T.text} size={15} />
              </div>
            </div>
          </div>

          {/* Reto de cálculo: predice la rapidez máxima (pilar: hacer cálculos) */}
          <PrediccionVCard
            accent={accent}
            gLive={planeta.g}
            lLive={largo}
            angLive={anguloDeg}
            mejor={mejorEstrellas}
            onResultado={registraEstrellas}
            playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
          />

          {/* Por qué funciona */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Por qué se conserva</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
              Al soltar el péndulo desde lo alto, toda su energía es <strong style={{ color: EP_COL }}>potencial</strong> (Ep = m·g·h) y no se mueve. Al caer, esa energía se transforma en <strong style={{ color: EC_COL }}>cinética</strong> (Ec = ½·m·v²): abajo la rapidez es máxima. Sube de nuevo y la cinética vuelve a ser potencial. <strong style={{ color: T.text }}>Sin fricción, Ep + Ec es siempre la misma.</strong>
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>LA LEY</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                La energía no se crea ni se destruye, solo se transforma. Con fricción no se pierde: pasa a <strong style={{ color: HEAT_COL }}>calor</strong>.
              </div>
              <div style={{ marginTop: 9, fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>Ep + Ec + Calor = E₀</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Gravedad (planeta)</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLANETAS.map((p) => {
              const on = p.key === planetaKey;
              return (
                <button key={p.key} className="ex-esc" data-on={on} onClick={() => cambiarPlaneta(p.key)}>
                  <i className={`fa-solid ${p.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: on ? accent : T.text3 }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{p.nombre}</span>
                    <span style={{ fontSize: 11.5, color: T.text3, ...NUM }}>g = {fmtNum(p.g, 2)} m/s²</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Las fórmulas</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6, ...NUM }}>
            <div><strong style={{ color: EP_COL }}>Ep</strong> = m · g · h</div>
            <div><strong style={{ color: EC_COL }}>Ec</strong> = ½ · m · v²</div>
            <div>h = L · (1 − cos θ)</div>
            <div>v<sub>máx</sub> = √(2 · g · h)</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿La masa cambia la rapidez máxima? Cámbiala y observa v<sub>máx</sub>.</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />En la Luna, ¿el péndulo va más lento o más rápido? ¿Por qué?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Con fricción, ¿a dónde se fue la energía? No se perdió.</div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            <strong style={{ color: accent }}>Pausa</strong> el péndulo en cualquier punto para comparar las barras de <strong style={{ color: EP_COL }}>Ep</strong> y <strong style={{ color: EC_COL }}>Ec</strong>.
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
            Fíjate: cambiar la <strong style={{ color: EC_COL }}>masa</strong> no cambia la <strong style={{ color: T.text }}>rapidez máxima</strong> (v depende solo de g y h), pero sí cambia la <strong style={{ color: EP_COL }}>energía</strong>. La gravedad sí cambia ambas.
          </span>
        </div>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla ───────────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
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
        playPick={sonido ? () => audioRef.current?.blip() : undefined}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <aside className="ex-drawer" data-open={drawerOpen} aria-hidden={!drawerOpen}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawerOpen(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={CONSERVACION_ENERGIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Reto de cálculo: predice la rapidez máxima con v = √(2·g·h) ──────── */
function PrediccionVCard({
  accent,
  gLive,
  lLive,
  angLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  gLive: number;
  lLive: number;
  angLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ g: number; L: number; ang: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap({ g: gLive, L: lLive, ang: angLive });
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const hSnap = snap ? altura(snap.L, grados2rad(snap.ang)) : 0;
  const vEsp = snap ? velocidadMax(snap.g, snap.L, grados2rad(snap.ang)) : 0;
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - vEsp) <= Math.max(0.15, vEsp * 0.04);

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
        Reto de cálculo · Predice la rapidez máxima
      </Eyebrow>

      <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura del estado actual del péndulo. En el punto más bajo toda la energía es cinética, así que{" "}
        <strong style={{ color: accent, ...NUM }}>v = √(2·g·h)</strong> con{" "}
        <strong style={{ color: accent, ...NUM }}>h = L·(1 − cos θ)</strong>. Calcúlala y compárala con la rapidez de la escena. (La masa no influye.)
      </div>

      {!snap ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura del péndulo
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Snap label="g" value={`${fmtNum(snap.g, 2)} m/s²`} col={accent} />
            <Snap label="L" value={`${fmtNum(snap.L, 1)} m`} col={EP_COL} />
            <Snap label="θ" value={`${snap.ang}°`} col={EC_COL} />
            <Snap label="h = L(1−cos θ)" value={`${fmtNum(hSnap, 2)} m`} col={T.text2} />
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuál es la rapidez máxima v? (m/s)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: 320 }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="m/s"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text2 }}>m/s</span>
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
                    ¡Correcto! v = {fmtNum(vEsp, 2)} m/s
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    h = {fmtNum(snap.L, 1)} × (1 − cos {snap.ang}°) = {fmtNum(hSnap, 2)} m; v = √(2 × {fmtNum(snap.g, 2)} × {fmtNum(hSnap, 2)}) = {fmtNum(vEsp, 2)} m/s. Coincide con la rapidez del punto bajo.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Primero saca h = L·(1 − cos θ) y luego v = √(2·g·h). Revisa que uses el ángulo en grados al sacar el coseno. Vuelve a intentarlo.
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

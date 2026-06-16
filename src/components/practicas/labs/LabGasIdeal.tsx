"use client";

/**
 * Laboratorio 3D — Gas ideal y primera ley de la termodinámica.
 * Práctica experimental para CNEYT-II-P09-A1
 * ("Gas ideal y primera ley de la termodinámica").
 *
 * Un gas encerrado en un cilindro con pistón es un sistema cerrado. Su estado se
 * describe con P, V, T y n, relacionados por PV = nRT. El lab hace visible de
 * dónde sale la presión: las partículas chocan contra las paredes y el pistón.
 * Sube T y se mueven más rápido (↑P); baja V y chocan más seguido (↑P); mete más
 * gas (↑n) y hay más choques (↑P). La energía interna U = 3/2·n·R·T y la primera
 * ley ΔU = Q − W cierran la idea: la energía solo cambia de forma o se transfiere.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 *
 * Robustecido (máxima interactividad): el alumno se EQUIPA (EppGate), SIGUE PASOS
 * (stepper guiado), ARRASTRA el pistón en 3D para comprimir el gas (PV = nRT
 * responde en tiempo real), ve las PARTÍCULAS chocar y HACE EL CÁLCULO: predice
 * la presión con la ecuación de estado y gana estrellas (récord local).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { GAS_IDEAL_FICHA } from "./gas-ideal-piston-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./gas-ideal-piston-data";
import { EppGate } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  presion,
  energiaInterna,
  kelvinACelsius,
  fmtNum,
  R_GAS,
  T_MIN, T_MAX, T_STEP,
  V_MIN, V_MAX, V_STEP,
  N_MIN, N_MAX, N_STEP,
  P_GAUGE_MAX,
} from "./gas-ideal-data";

const GasIdealScene = dynamic(() => import("./GasIdealScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wind fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const T_COL = "#FF7A45"; // temperatura → cálido
const V_COL = "#3BA7FF"; // volumen → azul
const N_COL = "#34D399"; // cantidad → verde
const WARN = "#FF8A3C";
const RETO_KEY = "cen-gas-ideal-reto";

export function LabGasIdeal({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [temp, setTemp] = useState(300); // K
  const [volumen, setVolumen] = useState(10); // L
  const [moles, setMoles] = useState(1.0); // mol
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

  // objetivos / pasos
  const [subioTemp, setSubioTemp] = useState(false);
  const [comprimio, setComprimio] = useState(false);
  const [cambioMoles, setCambioMoles] = useState(false);
  const [pauso, setPauso] = useState(false);
  const [arrastro, setArrastro] = useState(false); // usó el arrastre del pistón
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo de P
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false); // quiz A2

  // diagrama P–V en vivo (traza de puntos de operación)
  const [muestras, setMuestras] = useState<{ V: number; P: number }[]>([]);

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

  // valores de estado (calculados de los controles)
  const P = useMemo(() => presion(moles, temp, volumen), [moles, temp, volumen]);
  const U = useMemo(() => energiaInterna(moles, temp), [moles, temp]);
  const tC = useMemo(() => kelvinACelsius(temp), [temp]);
  const pAtm = P / 101.325; // kPa → atm

  const bump = () => setResetNonce((n) => n + 1);

  // registra un punto (V, P) en el diagrama (limitado para no crecer sin fin)
  const registraMuestra = useCallback((v: number, n: number, t: number) => {
    const p = presion(n, t, v);
    setMuestras((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.V - v) < 0.01 && Math.abs(last.P - p) < 0.5) return prev;
      const next = [...prev, { V: v, P: p }];
      return next.length > 90 ? next.slice(next.length - 90) : next;
    });
  }, []);

  const cambiarTemp = (v: number) => { setTemp(v); if (sonido) audioRef.current?.blip(); if (v > 300) setSubioTemp(true); registraMuestra(volumen, moles, v); };
  const cambiarVolumen = (v: number) => { setVolumen(v); if (v < 10) setComprimio(true); registraMuestra(v, moles, temp); };
  const cambiarVolumenSlider = (v: number) => { cambiarVolumen(v); if (sonido) audioRef.current?.blip(); };
  const cambiarMoles = (v: number) => { setMoles(v); if (sonido) audioRef.current?.blip(); if (v !== 1.0) setCambioMoles(true); registraMuestra(volumen, v, temp); };
  // el pistón arrastrado en 3D entra por aquí
  const onArrastrePiston = useCallback((v: number) => {
    setArrastro(true);
    setVolumen(v);
    if (v < 10) setComprimio(true);
    registraMuestra(v, moles, temp);
  }, [moles, temp, registraMuestra]);

  const togglePausa = () => { setPausado((p) => { if (!p) setPauso(true); return !p; }); };
  const reset = () => { setTemp(300); setVolumen(10); setMoles(1.0); setMuestras([]); bump(); };

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
    { t: "Carga gas y calienta", icon: "fa-temperature-arrow-up", done: subioTemp || cambioMoles },
    { t: "Comprime: arrastra el pistón", icon: "fa-down-left-and-up-right-to-center", done: comprimio },
    { t: "Calcula la presión (PV = nRT)", icon: "fa-calculator", done: predicho },
  ];
  const pasoActivo = pasos.findIndex((p) => !p.done);

  const objetivos = [
    { txt: "Calienta el gas y observa la presión", done: subioTemp },
    { txt: "Arrastra el pistón para comprimir", done: arrastro },
    { txt: "Cambia la cantidad de gas (n)", done: cambioMoles },
    { txt: "Pausa para contar los choques", done: pauso },
    { txt: "Calcula la presión con PV = nRT", done: predicho },
    { txt: "Resuelve el reto evaluable (A2)", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wind" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>P · V = n · R · T</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la presión nace de los choques de las partículas; más temperatura o menos volumen significan más presión.
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
              <GasIdealScene
                temp={temp}
                volumen={volumen}
                moles={moles}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onVolumenChange={onArrastrePiston}
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
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>PV = nRT</span>
            </div>

            {/* Estado del gas */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 16, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: accent }}>P = {fmtNum(P, 0)} kPa</span>
              <span style={{ color: T.text3, fontWeight: 700 }}>({fmtNum(pAtm, 2)} atm)</span>
            </div>

            {/* Diagrama P–V flotante */}
            {eppListo && (
              <div style={{ position: "absolute", bottom: 14, right: 14, padding: "10px 12px 8px", borderRadius: 14, background: "rgba(2,12,28,0.82)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
                <DiagramaPV muestras={muestras} n={moles} T={temp} Vactual={volumen} accent={accent} />
              </div>
            )}

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
              <button className="ex-icobtn" onClick={reset} title="Reiniciar el gas">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

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
              Variables de estado del gas
            </Eyebrow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: T_COL }}>
                    <i className="fa-solid fa-temperature-half" style={{ marginRight: 6 }} />
                    Temperatura
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: T_COL, ...NUM }}>{temp} K</span>
                </div>
                <input type="range" className="ex-range" min={T_MIN} max={T_MAX} step={T_STEP} value={temp}
                  onChange={(e) => cambiarTemp(Number(e.target.value))}
                  style={{ ["--exc" as string]: T_COL, ["--exfill" as string]: `${((temp - T_MIN) / (T_MAX - T_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: V_COL }}>
                    <i className="fa-solid fa-down-left-and-up-right-to-center" style={{ marginRight: 6 }} />
                    Volumen
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: V_COL, ...NUM }}>{fmtNum(volumen, 1)} L</span>
                </div>
                <input type="range" className="ex-range" min={V_MIN} max={V_MAX} step={V_STEP} value={volumen}
                  onChange={(e) => cambiarVolumenSlider(Number(e.target.value))}
                  style={{ ["--exc" as string]: V_COL, ["--exfill" as string]: `${((volumen - V_MIN) / (V_MAX - V_MIN)) * 100}%` }} />
                <div style={{ marginTop: 5, fontSize: 10.5, color: T.text3, textAlign: "center" }}>
                  <i className="fa-solid fa-hand-pointer" style={{ marginRight: 5 }} />
                  o arrastra el pistón en la escena
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: N_COL }}>
                    <i className="fa-solid fa-atom" style={{ marginRight: 6 }} />
                    Cantidad (n)
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: N_COL, ...NUM }}>{fmtNum(moles, 1)} mol</span>
                </div>
                <input type="range" className="ex-range" min={N_MIN} max={N_MAX} step={N_STEP} value={moles}
                  onChange={(e) => cambiarMoles(Number(e.target.value))}
                  style={{ ["--exc" as string]: N_COL, ["--exfill" as string]: `${((moles - N_MIN) / (N_MAX - N_MIN)) * 100}%` }} />
              </div>
            </div>

            {/* lecturas */}
            <div style={{ display: "flex", flexWrap: "wrap", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, overflow: "hidden" }}>
              <div style={{ flex: "1 1 0", minWidth: 96 }}>
                <Readout label="Presión" value={fmtNum(P, 0)} unit="kPa" col={accent} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Volumen" value={fmtNum(volumen, 1)} unit="L" col={V_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Temperatura" value={fmtNum(tC, 0)} unit="°C" col={T_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Energía interna" value={fmtNum(U, 0)} unit="J" col={N_COL} size={15} />
              </div>
            </div>
          </div>

          {/* Reto de cálculo: predice la presión (pilar: hacer cálculos) */}
          <PrediccionPCard
            accent={accent}
            nLive={moles}
            tLive={temp}
            vLive={volumen}
            mejor={mejorEstrellas}
            onResultado={registraEstrellas}
            playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
          />

          {/* Por qué funciona */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>De dónde sale la presión</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
              La <strong style={{ color: accent }}>presión</strong> es el resultado de millones de choques de las partículas contra las paredes. Si subes la <strong style={{ color: T_COL }}>temperatura</strong>, se mueven más rápido y golpean con más fuerza. Si bajas el <strong style={{ color: V_COL }}>volumen</strong>, el mismo gas choca más seguido. Si metes más <strong style={{ color: N_COL }}>gas</strong> (n), hay más partículas chocando. Todo se resume en una sola ecuación.
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>PRIMERA LEY DE LA TERMODINÁMICA</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                La energía interna del gas solo cambia por el <strong style={{ color: T_COL }}>calor</strong> que entra (Q) menos el <strong style={{ color: V_COL }}>trabajo</strong> que hace al expandirse (W). La energía no se crea ni se destruye.
              </div>
              <div style={{ marginTop: 9, fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>ΔU = Q − W</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>La ecuación de estado</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6, ...NUM }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: accent }}>P · V = n · R · T</div>
            <div><strong style={{ color: accent }}>P</strong> = presión (kPa)</div>
            <div><strong style={{ color: V_COL }}>V</strong> = volumen (L)</div>
            <div><strong style={{ color: N_COL }}>n</strong> = cantidad (mol)</div>
            <div><strong style={{ color: T_COL }}>T</strong> = temperatura (K)</div>
            <div>R = {fmtNum(R_GAS, 3)} J/mol·K</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>El gas ideal</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Un modelo donde las partículas no interactúan (salvo en choques) y su volumen propio es despreciable. Describe bien a los gases reales a <strong style={{ color: T.text }}>baja presión y alta temperatura</strong>.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Si duplicas la temperatura (en K) sin cambiar V ni n, ¿qué pasa con P?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Comprime a la mitad el volumen: ¿la presión sube al doble?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué la temperatura va en kelvin y no en °C?</div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            <strong style={{ color: accent }}>Pausa</strong> el gas para ver las partículas detenidas y comparar cuántas hay y qué tan apretadas están.
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
            Fíjate: P, V y T están <strong style={{ color: T.text }}>amarradas</strong>. No puedes cambiar una sin que las otras (o la presión) respondan. Eso es lo que dice <strong style={{ color: accent }}>PV = nRT</strong>.
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
          <FichaTeorica data={GAS_IDEAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Diagrama P–V (isoterma de Boyle) en vivo ─────────────────────────── */
function DiagramaPV({ muestras, n, T: temp, Vactual, accent }: { muestras: { V: number; P: number }[]; n: number; T: number; Vactual: number; accent: string }) {
  const W = 168, H = 116, PAD_L = 26, PAD_B = 18, PAD_T = 8, PAD_R = 8;
  const iw = W - PAD_L - PAD_R, ih = H - PAD_T - PAD_B;
  const x = (v: number) => PAD_L + ((v - V_MIN) / (V_MAX - V_MIN)) * iw;
  const y = (p: number) => PAD_T + ih - (Math.min(P_GAUGE_MAX, Math.max(0, p)) / P_GAUGE_MAX) * ih;

  // isoterma teórica P = nRT/V para los n,T actuales
  const iso: string[] = [];
  const STEPS = 28;
  for (let i = 0; i <= STEPS; i++) {
    const v = V_MIN + (i / STEPS) * (V_MAX - V_MIN);
    iso.push(`${x(v).toFixed(1)},${y(presion(n, temp, v)).toFixed(1)}`);
  }
  const Pactual = presion(n, temp, Vactual);

  return (
    <div style={{ width: W }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.42)", marginBottom: 4 }}>
        DIAGRAMA P–V (isoterma)
      </div>
      <svg width={W} height={H} style={{ display: "block" }}>
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + ih} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        <line x1={PAD_L} y1={PAD_T + ih} x2={W - PAD_R} y2={PAD_T + ih} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        <text x={PAD_L - 4} y={PAD_T + 8} textAnchor="end" fontSize={7.5} fill="rgba(255,255,255,0.42)">P</text>
        <text x={W - PAD_R} y={H - 5} textAnchor="end" fontSize={7.5} fill="rgba(255,255,255,0.42)">V →</text>
        <polyline points={iso.join(" ")} fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth={1.4} strokeDasharray="3 3" />
        {muestras.map((m, i) => (
          <circle key={i} cx={x(m.V)} cy={y(m.P)} r={1.6} fill={accent} opacity={0.55} />
        ))}
        <circle cx={x(Vactual)} cy={y(Pactual)} r={3.4} fill="#fff" stroke={accent} strokeWidth={2} />
      </svg>
    </div>
  );
}

/* ── Reto de cálculo: predice la presión con PV = nRT ─────────────────── */
function PrediccionPCard({
  accent,
  nLive,
  tLive,
  vLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  nLive: number;
  tLive: number;
  vLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ n: number; T: number; V: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap({ n: nLive, T: tLive, V: vLive });
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const Pesp = snap ? presion(snap.n, snap.T, snap.V) : 0;
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - Pesp) <= Math.max(6, Pesp * 0.04);

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
        Reto de cálculo · Predice la presión
      </Eyebrow>

      <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura del estado actual de tu gas y calcula la presión con la ecuación de estado{" "}
        <strong style={{ color: accent, ...NUM }}>P = n·R·T / V</strong> (recuerda R = {fmtNum(R_GAS, 3)} J/mol·K y que con V en litros el resultado sale en kPa). Compruébalo contra el manómetro.
      </div>

      {!snap ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura del gas
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <Snap label="n" value={`${fmtNum(snap.n, 1)} mol`} col={N_COL} />
            <Snap label="R" value={`${fmtNum(R_GAS, 3)}`} col={T.text2} />
            <Snap label="T" value={`${snap.T} K`} col={T_COL} />
            <Snap label="V" value={`${fmtNum(snap.V, 1)} L`} col={V_COL} />
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuál es la presión P? (kPa)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: 320 }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="kPa"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text2 }}>kPa</span>
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
                    ¡Correcto! P = {fmtNum(Pesp, 0)} kPa
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    P = ({fmtNum(snap.n, 1)} × {fmtNum(R_GAS, 3)} × {snap.T}) / {fmtNum(snap.V, 1)} = {fmtNum(Pesp, 1)} kPa. Coincide con el manómetro de la escena.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Sustituye n, R, T y V en P = n·R·T / V y revisa tus unidades (T en kelvin, V en litros). Vuelve a intentarlo.
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

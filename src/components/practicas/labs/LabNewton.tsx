"use client";

/**
 * Laboratorio 3D — "Diagrama de cuerpo libre: las leyes de Newton".
 * Práctica experimental para CNEYT-V-P01-A2 (simulacion "Simulación de fuerzas:
 * diagrama de cuerpo libre interactivo"; progresión 1, UAC CNEYT-V "La energía en
 * procesos de vida diaria").
 *
 * El alumno elige un escenario (caja en plano horizontal, caja en plano inclinado
 * a θ, o sistema con polea) y ve el DIAGRAMA DE CUERPO LIBRE en 3D: el objeto
 * aislado con TODAS sus fuerzas (peso, normal, fricción, tensión) dibujadas como
 * flechas a escala. Mueve masa, ángulo, fuerza aplicada y coeficientes de fricción
 * y observa cuándo ΣF = 0 (equilibrio, 1ª ley) y cuándo ΣF ≠ 0 → a = ΣF/m (2ª ley).
 * Toda la física es de cálculo cerrado con g = 9.81 m/s².
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { NEWTON_FICHA } from "./dcl-leyes-newton-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./dcl-leyes-newton-data";
import { LabSfx } from "./lab-audio";
import {
  resolver, escenario, ESCENARIOS,
  M_MIN, M_MAX, F_MIN, F_MAX, TH_MIN, TH_MAX, MU_MIN, MU_MAX,
  M_DEF, F_DEF, TH_DEF, M1_DEF, M2_DEF, MUS_DEF, MUK_DEF,
  PASOS, IDEAS, DATOS, REFLEXION, fmt0, fmt1, fmt2,
  type Modo,
} from "./newton-data";

const NewtonScene = dynamic(() => import("./NewtonScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-up-down-left-right fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Dibujando las fuerzas…</span>
    </div>
  ),
});

const C_PESO = "#f87171";
const C_NORM = "#34D399";
const C_FRIC = "#fb923c";
const C_APLI = "#C084FC";
const C_TENS = "#fbbf24";
const C_NETO = "#7dd3fc";

export function LabNewton({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("inclinado"); // arranca en el plano a 30° (verbatim)
  const [m, setM] = useState<number>(M_DEF);
  const [F, setF] = useState<number>(F_DEF);
  const [theta, setTheta] = useState<number>(TH_DEF);
  const [m1, setM1] = useState<number>(M1_DEF);
  const [m2, setM2] = useState<number>(M2_DEF);
  const [muS, setMuS] = useState<number>(MUS_DEF);
  const [muK, setMuK] = useState<number>(MUK_DEF);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // teoría (cajón deslizable) y sonido
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

  // Animación: barre la variable "motriz" del escenario de ida y vuelta.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (modo === "horizontal") {
        const span = F_MAX - F_MIN;
        setF((prev) => {
          let next = prev + dir * dt * span * 0.28;
          if (next <= F_MIN) { next = F_MIN; dir = 1; }
          else if (next >= F_MAX) { next = F_MAX; dir = -1; }
          return next;
        });
      } else if (modo === "inclinado") {
        const span = TH_MAX - TH_MIN;
        setTheta((prev) => {
          let next = prev + dir * dt * span * 0.28;
          if (next <= TH_MIN) { next = TH_MIN; dir = 1; }
          else if (next >= TH_MAX) { next = TH_MAX; dir = -1; }
          return next;
        });
      } else {
        const span = M_MAX - M_MIN;
        setM2((prev) => {
          let next = prev + dir * dt * span * 0.28;
          if (next <= M_MIN) { next = M_MIN; dir = 1; }
          else if (next >= M_MAX) { next = M_MAX; dir = -1; }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo]);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarModo = (nm: Modo) => { setPlaying(false); setModo(nm); bump(); if (sonido) audioRef.current?.blip(); };
  const reset = () => {
    setPlaying(false);
    setM(M_DEF); setF(F_DEF); setTheta(TH_DEF);
    setM1(M1_DEF); setM2(M2_DEF); setMuS(MUS_DEF); setMuK(MUK_DEF);
    bump();
  };

  // mantener μk ≤ μs (físicamente la cinética no supera a la estática)
  const setMuSafe = (s: number) => { setMuS(s); if (muK > s) setMuK(s); };
  const setMuKSafe = (k: number) => { setMuK(Math.min(k, muS)); };

  const info = escenario(modo);
  const d = resolver(modo, { m, F, theta, m1, m2, muS, muK });

  // lectura en vivo según el estado del DCL
  let lectura: string;
  if (!d.mueve) {
    if (modo === "horizontal") lectura = `ΣF = 0: la fricción estática (hasta f_s,máx = ${fmt0(d.fsMax)} N) equilibra a F = ${fmt0(F)} N. El cuerpo NO arranca (1ª ley).`;
    else if (modo === "inclinado") lectura = `ΣF = 0: la fricción estática (hasta f_s,máx = ${fmt0(d.fsMax)} N) sostiene el peso a favor del plano (${fmt0(d.aplicada)} N). La caja NO desliza.`;
    else lectura = `ΣF = 0: el peso colgante m₂·g = ${fmt0(d.aplicada)} N no supera f_s,máx = ${fmt0(d.fsMax)} N. El sistema NO se mueve.`;
  } else {
    lectura = `ΣF = ${fmt0(d.neto)} N ≠ 0 → a = ΣF/m = ${fmt1(d.a)} m/s² (2ª ley). La fricción cinética f_k = ${fmt0(d.fric)} N se opone al movimiento.`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-arrows-up-down-left-right" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>ΣF = m·a</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: aísla el objeto, dibuja todas las fuerzas y súmalas. Si ΣF = 0 hay equilibrio (a = 0); si no, acelera con a = ΣF/m. Ahora mismo: a = {fmt1(d.a)} m/s².
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes nwPulse { 0%,100%{ box-shadow:0 0 0 0 var(--nwc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .nw-live-dot { animation: nwPulse 1.6s ease-in-out infinite; }
        .nw-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .nw-grid { grid-template-columns: 1fr; } }
        .nw-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .nw-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .nw-icobtn:hover { background:rgba(255,255,255,0.12); }
        .nw-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--nwc) 0%, var(--nwc) var(--nwfill), rgba(255,255,255,0.12) var(--nwfill), rgba(255,255,255,0.12) 100%); }
        .nw-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--nwc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .nw-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--nwc); cursor:pointer; }
        .nw-seg { cursor:pointer; padding:9px 13px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; display:flex; align-items:center; gap:8px; }
        .nw-seg:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .nw-seg[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        @media (max-width: 1000px){ .nw-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .nw-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .nw-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .nw-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .nw-drawer[data-open="true"] { transform:translateX(0); }
        .nw-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .nw-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .nw-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .nw-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .nw-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .nw-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      <div className="nw-grid">
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
              <NewtonScene modo={modo} m={m} F={F} theta={theta} m1={m1} m2={m2} muS={muS} muK={muK} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="nw-live-dot" style={{ ["--nwc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>ΣF = m·a</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="nw-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="nw-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="nw-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Barrer la variable del escenario"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="nw-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="nw-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Leyenda de fuerzas */}
            <div style={{ position: "absolute", top: 60, left: 16, display: "flex", flexDirection: "column", gap: 6, padding: "9px 12px", borderRadius: 12, background: "rgba(4,10,22,0.7)", border: `1px solid ${T.line}`, backdropFilter: "blur(8px)" }}>
              <LegItem col={C_PESO} txt="peso  W = m·g" />
              <LegItem col={C_NORM} txt="normal  N" />
              <LegItem col={C_FRIC} txt="fricción  f" />
              {modo === "horizontal" && <LegItem col={C_APLI} txt="fuerza aplicada  F" />}
              {modo === "polea" && <LegItem col={C_TENS} txt="tensión  T" />}
              <LegItem col={C_NETO} txt="fuerza neta  ΣF" />
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                {d.mueve ? (
                  <><i className="fa-solid fa-gauge-high" style={{ color: C_NETO, marginRight: 7 }} />{lectura}</>
                ) : (
                  <><i className="fa-solid fa-scale-balanced" style={{ color: C_NORM, marginRight: 7 }} />{lectura}</>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {info.titulo} · arrastra para orbitar y mira cada flecha: su largo es proporcional a la magnitud de la fuerza (en newtons).
              </div>
            </div>
          </div>

          {/* Selector de escenario */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
              Elige el escenario del diagrama de cuerpo libre
            </Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.modo} className="nw-seg" data-on={modo === e.modo} onClick={() => cambiarModo(e.modo)} title={e.titulo}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: modo === e.modo ? accent : T.text3 }} />
                  {e.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* Controles (varían según el escenario) */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Explora las variables del escenario
            </Eyebrow>
            <div style={{ display: "grid", gap: 18 }}>
              {modo === "horizontal" && (
                <>
                  <Deslizador label="masa  m (kg)" icon="fa-cube" colr="#1e88c7" valor={`${fmt1(m)} kg`}
                    min={M_MIN} max={M_MAX} step={0.1} value={m}
                    onChange={(v) => { setPlaying(false); setM(v); }} hintL={`${fmt1(M_MIN)}`} hintR={`${fmt0(M_MAX)}`} />
                  <Deslizador label="fuerza aplicada  F (N)" icon="fa-hand-point-right" colr={C_APLI} valor={`${fmt0(F)} N`}
                    min={F_MIN} max={F_MAX} step={0.5} value={F}
                    onChange={(v) => { setPlaying(false); setF(v); }} hintL={`${fmt0(F_MIN)}`} hintR={`${fmt0(F_MAX)}`} />
                </>
              )}
              {modo === "inclinado" && (
                <>
                  <Deslizador label="masa  m (kg)" icon="fa-cube" colr="#1e88c7" valor={`${fmt1(m)} kg`}
                    min={M_MIN} max={M_MAX} step={0.1} value={m}
                    onChange={(v) => { setPlaying(false); setM(v); }} hintL={`${fmt1(M_MIN)}`} hintR={`${fmt0(M_MAX)}`} />
                  <Deslizador label="ángulo del plano  θ (°)" icon="fa-mountain" colr="#facc15" valor={`${fmt0(theta)}°`}
                    min={TH_MIN} max={TH_MAX} step={1} value={theta}
                    onChange={(v) => { setPlaying(false); setTheta(v); }} hintL={`${fmt0(TH_MIN)}°`} hintR={`${fmt0(TH_MAX)}°`} />
                </>
              )}
              {modo === "polea" && (
                <>
                  <Deslizador label="masa sobre la mesa  m₁ (kg)" icon="fa-cube" colr="#1e88c7" valor={`${fmt1(m1)} kg`}
                    min={M_MIN} max={M_MAX} step={0.1} value={m1}
                    onChange={(v) => { setPlaying(false); setM1(v); }} hintL={`${fmt1(M_MIN)}`} hintR={`${fmt0(M_MAX)}`} />
                  <Deslizador label="masa colgante  m₂ (kg)" icon="fa-weight-hanging" colr="#7c5cff" valor={`${fmt1(m2)} kg`}
                    min={M_MIN} max={M_MAX} step={0.1} value={m2}
                    onChange={(v) => { setPlaying(false); setM2(v); }} hintL={`${fmt1(M_MIN)}`} hintR={`${fmt0(M_MAX)}`} />
                </>
              )}
              <Deslizador label="coef. fricción estática  μ_s" icon="fa-shoe-prints" colr={C_FRIC} valor={fmt2(muS)}
                min={MU_MIN} max={MU_MAX} step={0.01} value={muS}
                onChange={(v) => { setPlaying(false); setMuSafe(v); }} hintL={`${fmt0(MU_MIN)}`} hintR={`${fmt0(MU_MAX)}`} />
              <Deslizador label="coef. fricción cinética  μ_k  (≤ μ_s)" icon="fa-shoe-prints" colr="#fdba74" valor={fmt2(muK)}
                min={MU_MIN} max={MU_MAX} step={0.01} value={muK}
                onChange={(v) => { setPlaying(false); setMuKSafe(v); }} hintL={`${fmt0(MU_MIN)}`} hintR={`${fmt0(MU_MAX)}`} />
            </div>
          </div>

          {/* DCL en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-vector-square" style={{ marginRight: 8, color: accent }} />
              Las fuerzas sobre el objeto aislado
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              <MiniVal label="peso  W = m·g" value={`${fmt1(d.W)} N`} col={C_PESO} />
              <MiniVal label="normal  N" value={`${fmt1(d.N)} N`} col={C_NORM} />
              <MiniVal label="fricción  f" value={`${fmt1(d.fric)} N`} col={C_FRIC} />
              {modo === "polea"
                ? <MiniVal label="tensión  T" value={`${fmt1(d.T ?? 0)} N`} col={C_TENS} />
                : modo === "horizontal"
                  ? <MiniVal label="aplicada  F" value={`${fmt1(F)} N`} col={C_APLI} />
                  : <MiniVal label="mg·senθ" value={`${fmt1(d.Wpar ?? 0)} N`} col={C_APLI} />}
              <MiniVal label="fuerza neta  ΣF" value={`${fmt1(d.neto)} N`} col={C_NETO} />
              <MiniVal label="aceleración  a" value={`${fmt2(d.a)} m/s²`} col={d.mueve ? C_NETO : C_NORM} />
            </div>
            <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 12, border: `1px solid ${(d.mueve ? C_NETO : C_NORM)}55`, background: `${(d.mueve ? C_NETO : C_NORM)}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
              <i className={`fa-solid ${d.mueve ? "fa-bolt" : "fa-scale-balanced"}`} style={{ color: d.mueve ? C_NETO : C_NORM, marginRight: 8 }} />
              {lectura}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El modelo del escenario */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className={`fa-solid ${info.icono}`} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{info.titulo}</div>
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              {info.modelo.map((eq, i) => (
                <ExprRow key={i} col={accent} txt={eq} />
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_NORM}44` }}>
              <i className="fa-solid fa-circle-info" style={{ color: C_NORM, marginTop: 2 }} />
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>
                Si la fuerza motriz no supera <strong style={{ color: "#fff" }}>f_s,máx = μ_s·N</strong>, el cuerpo queda en <strong style={{ color: C_NORM }}>equilibrio</strong> (ΣF = 0, a = 0). Al superarla, manda la cinética f_k = μ_k·N.
              </div>
            </div>
          </div>

          {/* Método del DCL paso a paso (verbatim A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              El diagrama de cuerpo libre — paso a paso
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

          {/* Preguntas para pensar (verbatim A2) */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Para pensar
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {REFLEXION.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <i className="fa-solid fa-angle-right" style={{ color: accent, marginTop: 3, flexShrink: 0 }} />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="nw-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="normal N" value={`${fmt1(d.N)}`} col={C_NORM} size={15} />
            <Readout label="fricción f" value={`${fmt1(d.fric)}`} col={C_FRIC} size={15} />
            <Readout label="neta ΣF" value={`${fmt1(d.neto)}`} col={C_NETO} size={15} />
            <Readout label="aceler. a" value={`${fmt2(d.a)}`} col={d.mueve ? C_NETO : C_NORM} size={15} />
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
          Física <strong>exacta</strong> de cálculo cerrado con <strong>g = 9.81 m/s²</strong>: poleas y cuerdas ideales (sin masa ni rozamiento en la polea), cuerda inextensible, fricción de Coulomb (f_k = μ_k·N, estática hasta f_s,máx = μ_s·N). El largo de cada flecha es proporcional a la fuerza en newtons (escala común), así que se pueden comparar entre sí; los tres escenarios (plano horizontal, plano inclinado y sistema con polea) son verbatim del enunciado A2.
        </span>
      </div>

      {/* ── Objetivos ──────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Identifica las fuerzas en el diagrama de cuerpo libre", done: true },
            { txt: "Explora los 3 escenarios: horizontal, inclinado y polea", done: ESCENARIOS.every((e) => e.modo === modo || true) },
            { txt: "Observa cuándo ΣF = 0 (equilibrio) y cuándo ΣF ≠ 0 (a = ΣF/m)", done: d.mueve },
            { txt: "Resuelve el reto evaluable de la actividad", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla A3 ────────────── */}
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
      <div className="nw-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="nw-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="nw-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="nw-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="nw-drawer-body">
          <FichaTeorica data={NEWTON_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
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
      <input type="range" className="nw-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--nwc" as string]: colr, ["--nwfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}

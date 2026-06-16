"use client";

/**
 * Laboratorio 3D — "Óptica geométrica: lentes, espejos y formación de imágenes".
 * Práctica experimental para CNEYT-V-P06-A2 (simulación "Simulación de óptica:
 * lentes, espejos y formación de imágenes"; progresión 6 "Óptica geométrica:
 * reflexión, refracción y la ley de Snell", UAC CNEYT-V "La energía en procesos
 * de vida diaria").
 *
 * Tres modos:
 *  (a) Lentes      — lente convergente o divergente: coloca el objeto a la
 *      distancia dₒ, traza los rayos principales y forma la imagen. Verifica
 *      1/f = 1/dₒ + 1/dᵢ y el aumento M = −dᵢ/dₒ.
 *  (b) Espejos     — espejo plano, cóncavo o convexo: la imagen real se forma del
 *      mismo lado del objeto (reflexión).
 *  (c) Refracción  — ley de Snell n₁·sen θ₁ = n₂·sen θ₂ entre dos medios y la
 *      reflexión total interna al superar el ángulo crítico (fibra óptica).
 * Toda la física es de cálculo cerrado (ecuación de Gauss y ley de Snell).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { OPTICA_FICHA } from "./optica-lentes-espejos-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./optica-lentes-espejos-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo, type TipoLente, type TipoEspejo,
  resolverGauss, resolverSnell, medioPorId, MEDIOS, CASOS_LENTE, CASOS_ESPEJO,
  F_LENTE_MIN, F_LENTE_MAX, F_LENTE_DEF, DO_MIN, DO_MAX, DO_LENTE_DEF,
  DO_ESPEJO_DEF, F_ESPEJO_DEF, H_OBJ,
  THETA_MIN, THETA_MAX, THETA_DEF, MEDIO1_DEF, MEDIO2_DEF,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, EJEMPLO, GLOSARIO,
  fmt2, fmtAng, fmtDist, fmtAumento,
} from "./optica-data";

const OpticaScene = dynamic(() => import("./OpticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-glasses fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Montando el banco óptico…</span>
    </div>
  ),
});

const C_LEN = "#a78bfa";
const C_LEN_DIV = "#f472b6";
const C_ESP = "#5eead4";
const C_REF = "#38bdf8";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "lentes",     etq: "Lentes",     icono: "fa-glasses",         col: C_LEN, desc: "Convergente / divergente: forma la imagen" },
  { id: "espejos",    etq: "Espejos",    icono: "fa-mirror",          col: C_ESP, desc: "Plano, cóncavo y convexo" },
  { id: "refraccion", etq: "Refracción", icono: "fa-water",           col: C_REF, desc: "Ley de Snell y reflexión total interna" },
];

const TIPOS_ESPEJO: { id: TipoEspejo; etq: string; icono: string }[] = [
  { id: "plano",   etq: "Plano",   icono: "fa-grip-lines-vertical" },
  { id: "concavo", etq: "Cóncavo", icono: "fa-circle-half-stroke" },
  { id: "convexo", etq: "Convexo", icono: "fa-circle-dot" },
];

export function LabOptica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("lentes");
  // teoría (cajón deslizable), estado evaluable y sonido
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
  // (a) lentes
  const [tipoLente, setTipoLente] = useState<TipoLente>("convergente");
  const [fLente, setFLente] = useState<number>(F_LENTE_DEF);
  const [doLente, setDoLente] = useState<number>(DO_LENTE_DEF);
  // (b) espejos
  const [tipoEspejo, setTipoEspejo] = useState<TipoEspejo>("concavo");
  const [fEspejo, setFEspejo] = useState<number>(F_ESPEJO_DEF);
  const [doEspejo, setDoEspejo] = useState<number>(DO_ESPEJO_DEF);
  // (c) refracción
  const [medio1, setMedio1] = useState<string>(MEDIO1_DEF);
  const [medio2, setMedio2] = useState<string>(MEDIO2_DEF);
  const [thetaInc, setThetaInc] = useState<number>(THETA_DEF);

  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "lentes") { setTipoLente("convergente"); setFLente(F_LENTE_DEF); setDoLente(DO_LENTE_DEF); }
    else if (modo === "espejos") { setTipoEspejo("concavo"); setFEspejo(F_ESPEJO_DEF); setDoEspejo(DO_ESPEJO_DEF); }
    else { setMedio1(MEDIO1_DEF); setMedio2(MEDIO2_DEF); setThetaInc(THETA_DEF); }
    bump();
  };
  const cambiarModo = (m: Modo) => { setModo(m); if (sonido) audioRef.current?.blip(); bump(); };

  // valores en vivo
  const fLentSign = tipoLente === "convergente" ? Math.abs(fLente) : -Math.abs(fLente);
  const rLente = resolverGauss(fLentSign, doLente, H_OBJ);
  const fEspSign = tipoEspejo === "plano" ? Infinity : tipoEspejo === "concavo" ? Math.abs(fEspejo) : -Math.abs(fEspejo);
  const rEspejo = resolverGauss(fEspSign, doEspejo, H_OBJ);
  const m1 = medioPorId(medio1);
  const m2 = medioPorId(medio2);
  const snell = resolverSnell(m1.n, m2.n, thetaInc);

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modo === "lentes" ? (tipoLente === "convergente" ? C_LEN : C_LEN_DIV) : modoActual.col;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-glasses" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>1/f = 1/dₒ + 1/dᵢ</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "lentes" && ` Lente ${tipoLente}: dᵢ = ${fmtDist(rLente.di)}, M = ${fmtAumento(rLente.M)} → imagen ${rLente.tipoImagen}, ${rLente.orientacion}, ${rLente.tamano}.`}
        {modo === "espejos" && ` Espejo ${tipoEspejo}: dᵢ = ${fmtDist(rEspejo.di)}, M = ${fmtAumento(rEspejo.M)} → imagen ${rEspejo.tipoImagen}, ${rEspejo.orientacion}, ${rEspejo.tamano}.`}
        {modo === "refraccion" && ` ${m1.nombre} → ${m2.nombre} a θ₁ = ${fmtAng(thetaInc)}: ${snell.reflexionTotal ? "reflexión total interna" : `θ₂ = ${fmtAng(snell.thetaRefDeg)}`}.`}
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
        .op-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .op-tab { cursor:pointer; border:1px solid var(--opc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .op-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .op-tab:hover { background:rgba(255,255,255,0.06); }
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
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="op-tabs">
          {MODOS.map((mo) => {
            const on = mo.id === modo;
            return (
              <button key={mo.id} className="op-tab" data-on={on} onClick={() => cambiarModo(mo.id)}
                style={{ ["--opc" as string]: mo.col, background: on ? `${mo.col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? mo.col : "inherit" }}><i className={`fa-solid ${mo.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{mo.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{mo.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="op-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <OpticaScene
                modo={modo}
                tipoLente={tipoLente} fLente={fLente} doLente={doLente}
                tipoEspejo={tipoEspejo} fEspejo={fEspejo} doEspejo={doEspejo}
                medio1={medio1} medio2={medio2} thetaInc={thetaInc}
                playing={playing} accent={accent} resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="op-live-dot" style={{ ["--opc" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{modoActual.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="op-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="op-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="op-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="op-icobtn" onClick={resetModo} title="Reiniciar a los valores de inicio">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="op-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "lentes" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-glasses" style={{ color: modoCol, marginRight: 7 }} />
                  Lente {tipoLente}: f = {fmtDist(fLentSign)} · dₒ = {fmtDist(doLente)} · dᵢ = {fmtDist(rLente.di)} · M = {fmtAumento(rLente.M)} · imagen {rLente.tipoImagen}
                </div>
              )}
              {modo === "espejos" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-mirror" style={{ color: modoCol, marginRight: 7 }} />
                  Espejo {tipoEspejo}: dₒ = {fmtDist(doEspejo)} · dᵢ = {fmtDist(rEspejo.di)} · M = {fmtAumento(rEspejo.M)} · imagen {rEspejo.tipoImagen}, {rEspejo.orientacion}
                </div>
              )}
              {modo === "refraccion" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-water" style={{ color: modoCol, marginRight: 7 }} />
                  {m1.nombre} (n₁={fmt2(m1.n)}) → {m2.nombre} (n₂={fmt2(m2.n)}) · θ₁ = {fmtAng(thetaInc)} · {snell.reflexionTotal ? "REFLEXIÓN TOTAL INTERNA" : `θ₂ = ${fmtAng(snell.thetaRefDeg)}`}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {modo === "lentes" && "Mueve el objeto: lejos del foco da imagen real e invertida (cámara); dentro del foco, virtual y aumentada (lupa). La lente divergente siempre da imagen virtual, derecha y menor."}
                {modo === "espejos" && "El espejo plano da una imagen virtual del mismo tamaño detrás; el cóncavo puede formar imagen real (telescopio) o virtual aumentada (afeitar); el convexo siempre da imagen virtual menor con más campo (retrovisor)."}
                {modo === "refraccion" && "Cambia los medios y el ángulo: al pasar a un medio más denso el rayo se acerca a la normal. Si vas de denso a menos denso y superas el ángulo crítico, hay reflexión total interna: el principio de la fibra óptica."}
              </div>
            </div>
          </div>

          {/* Controles del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                {modo === "lentes" ? "Lente y posición del objeto" : modo === "espejos" ? "Espejo y posición del objeto" : "Medios y ángulo de incidencia"}
              </Eyebrow>
            </div>

            {modo === "lentes" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {(["convergente", "divergente"] as TipoLente[]).map((tp) => {
                    const on = tipoLente === tp;
                    const c = tp === "convergente" ? C_LEN : C_LEN_DIV;
                    return (
                      <button key={tp} className="op-tab" data-on={on} onClick={() => setTipoLente(tp)}
                        style={{ ["--opc" as string]: c, background: on ? `${c}22` : "transparent" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 900 }}>{tp === "convergente" ? "Convergente (f > 0)" : "Divergente (f < 0)"}</div>
                      </button>
                    );
                  })}
                </div>
                <Deslizador label="distancia focal  |f|" icon="fa-bullseye" colr={modoCol}
                  valor={fmtDist(Math.abs(fLente))} min={F_LENTE_MIN} max={F_LENTE_MAX} step={0.1} value={fLente}
                  onChange={setFLente} hintL="foco corto" hintR="foco largo" />
                <div style={{ height: 14 }} />
                <Deslizador label="distancia objeto  dₒ" icon="fa-arrows-left-right" colr={modoCol}
                  valor={fmtDist(doLente)} min={DO_MIN} max={DO_MAX} step={0.1} value={doLente}
                  onChange={setDoLente} hintL="cerca de la lente" hintR="lejos de la lente" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginTop: 14 }}>
                  {CASOS_LENTE.map((cs) => {
                    const on = cs.tipo === tipoLente && Math.abs(cs.f - fLente) < 0.05 && Math.abs(cs.do_ - doLente) < 0.05;
                    const c = cs.tipo === "convergente" ? C_LEN : C_LEN_DIV;
                    return (
                      <button key={cs.id} onClick={() => { setTipoLente(cs.tipo); setFLente(cs.f); setDoLente(cs.do_); }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : c, background: on ? c : `${c}1f`, border: `1px solid ${c}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: modoCol, marginRight: 8 }} />
                  1/f = 1/dₒ + 1/dᵢ → dᵢ = <strong style={{ color: modoCol }}>{fmtDist(rLente.di)}</strong>, M = −dᵢ/dₒ = <strong>{fmtAumento(rLente.M)}</strong>. Imagen <strong>{rLente.tipoImagen}</strong>, <strong>{rLente.orientacion}</strong> y <strong>{rLente.tamano}</strong>.
                </div>
              </>
            )}

            {modo === "espejos" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                  {TIPOS_ESPEJO.map((tp) => {
                    const on = tipoEspejo === tp.id;
                    return (
                      <button key={tp.id} className="op-tab" data-on={on} onClick={() => setTipoEspejo(tp.id)}
                        style={{ ["--opc" as string]: C_ESP, background: on ? `${C_ESP}22` : "transparent" }}>
                        <div style={{ fontSize: 15, marginBottom: 3, color: on ? C_ESP : "inherit" }}><i className={`fa-solid ${tp.icono}`} /></div>
                        <div style={{ fontSize: 12, fontWeight: 900 }}>{tp.etq}</div>
                      </button>
                    );
                  })}
                </div>
                {tipoEspejo !== "plano" && (
                  <>
                    <Deslizador label="distancia focal  |f|" icon="fa-bullseye" colr={C_ESP}
                      valor={fmtDist(Math.abs(fEspejo))} min={F_LENTE_MIN} max={F_LENTE_MAX} step={0.1} value={fEspejo}
                      onChange={setFEspejo} hintL="muy curvo" hintR="casi plano" />
                    <div style={{ height: 14 }} />
                  </>
                )}
                <Deslizador label="distancia objeto  dₒ" icon="fa-arrows-left-right" colr={C_ESP}
                  valor={fmtDist(doEspejo)} min={DO_MIN} max={DO_MAX} step={0.1} value={doEspejo}
                  onChange={setDoEspejo} hintL="cerca del espejo" hintR="lejos del espejo" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginTop: 14 }}>
                  {CASOS_ESPEJO.map((cs) => {
                    const on = cs.tipo === tipoEspejo && Math.abs(cs.do_ - doEspejo) < 0.05 && (cs.tipo === "plano" || Math.abs(cs.f - fEspejo) < 0.05);
                    return (
                      <button key={cs.id} onClick={() => { setTipoEspejo(cs.tipo); if (cs.tipo !== "plano") setFEspejo(cs.f); setDoEspejo(cs.do_); }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : C_ESP, background: on ? C_ESP : `${C_ESP}1f`, border: `1px solid ${C_ESP}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_ESP}44`, background: `${C_ESP}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-half-stroke" style={{ color: C_ESP, marginRight: 8 }} />
                  Espejo <strong>{tipoEspejo}</strong>: dᵢ = <strong style={{ color: C_ESP }}>{fmtDist(rEspejo.di)}</strong>, M = <strong>{fmtAumento(rEspejo.M)}</strong>. Imagen <strong>{rEspejo.tipoImagen}</strong>, <strong>{rEspejo.orientacion}</strong> y <strong>{rEspejo.tamano}</strong>.
                </div>
              </>
            )}

            {modo === "refraccion" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Medio 1 (incidencia) → Medio 2</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 8 }}>
                    {MEDIOS.map((md) => {
                      const on = md.id === medio1;
                      return (
                        <button key={`a${md.id}`} onClick={() => setMedio1(md.id)}
                          style={{ cursor: "pointer", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : md.color, background: on ? md.color : `${md.color}1f`, border: `1px solid ${md.color}66`, borderRadius: 8, padding: "8px 4px", lineHeight: 1.2 }}>
                          {md.nombre}<br /><span style={{ fontSize: 8.5, opacity: 0.8 }}>n={fmt2(md.n)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 6 }}>
                    {MEDIOS.map((md) => {
                      const on = md.id === medio2;
                      return (
                        <button key={`b${md.id}`} onClick={() => setMedio2(md.id)}
                          style={{ cursor: "pointer", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : md.color, background: on ? md.color : `${md.color}1f`, border: `1px dashed ${md.color}66`, borderRadius: 8, padding: "8px 4px", lineHeight: 1.2 }}>
                          {md.nombre}<br /><span style={{ fontSize: 8.5, opacity: 0.8 }}>n={fmt2(md.n)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Deslizador label="ángulo de incidencia  θ₁" icon="fa-angle-up" colr={C_REF}
                  valor={fmtAng(thetaInc)} min={THETA_MIN} max={THETA_MAX} step={1} value={thetaInc}
                  onChange={setThetaInc} hintL="0° (normal)" hintR="89° (rasante)" />
                {snell.thetaCriticoDeg != null && (
                  <button onClick={() => setThetaInc(Math.min(THETA_MAX, Math.ceil(snell.thetaCriticoDeg! + 2)))}
                    style={{ cursor: "pointer", width: "100%", marginTop: 12, fontSize: 11.5, fontWeight: 800, color: "#fde047", background: "rgba(251,191,36,0.12)", border: "1px solid #fbbf2466", borderRadius: 9, padding: "9px 10px" }}>
                    <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
                    Superar el ángulo crítico θ_c = {fmtAng(snell.thetaCriticoDeg)} → reflexión total interna
                  </button>
                )}
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${(snell.reflexionTotal ? "#fbbf24" : C_REF)}44`, background: `${(snell.reflexionTotal ? "#fbbf24" : C_REF)}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-water" style={{ color: snell.reflexionTotal ? "#fde047" : C_REF, marginRight: 8 }} />
                  {snell.reflexionTotal
                    ? <>n₁ = {fmt2(m1.n)} &gt; n₂ = {fmt2(m2.n)} y θ₁ = {fmtAng(thetaInc)} supera θ_c = {snell.thetaCriticoDeg != null ? fmtAng(snell.thetaCriticoDeg) : "—"}: <strong style={{ color: "#fde047" }}>reflexión total interna</strong>. La luz no escapa (fibra óptica).</>
                    : <>{fmt2(m1.n)}·sen {fmtAng(thetaInc)} = {fmt2(m2.n)}·sen θ₂ → θ₂ = <strong style={{ color: C_REF }}>{fmtAng(snell.thetaRefDeg)}</strong>. El rayo se {snell.seAcerca ? "acerca" : "aleja"} de la normal.</>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El banco óptico */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-glasses" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El banco óptico</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ejemplo resuelto */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: accent }} />
              Ejemplo resuelto
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 10 }}>{EJEMPLO.enunciado}</div>
            <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_REF}44` }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: C_REF, flexShrink: 0 }}>θ</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>θ₂ ≈ {fmtAng(EJEMPLO.thetaRef)}</div>
                <div style={{ fontSize: 10.5, color: T.text2, lineHeight: 1.3 }}>{EJEMPLO.solucion}</div>
              </div>
            </div>
          </div>

          {/* Pasos para explorar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Pasos para explorar
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas de reflexión verbatim */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Para reflexionar
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Objetivo evaluable ─────────────────────────────────────── */}
      <div style={{ ...card, padding: "16px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Explora los tres modos: lentes, espejos y refracción", done: false },
            { txt: "Verifica la ecuación de Gauss 1/f = 1/dₒ + 1/dᵢ", done: false },
            { txt: "Supera el ángulo crítico y observa reflexión total interna", done: false },
            { txt: "Resuelve el reto evaluable de la actividad", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="op-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${modoActual.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {modoActual.etq}
          </Eyebrow>
          {modo === "lentes" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="dist. focal f" value={fmtDist(fLentSign)} col={modoCol} size={14} />
              <Readout label="dist. objeto dₒ" value={fmtDist(doLente)} col="#fff" size={14} />
              <Readout label="dist. imagen dᵢ" value={fmtDist(rLente.di)} col={modoCol} size={14} />
              <Readout label="aumento M" value={fmtAumento(rLente.M)} col={rLente.orientacion === "invertida" ? "#fca5a5" : "#86efac"} size={14} />
            </div>
          )}
          {modo === "espejos" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="dist. focal f" value={fmtDist(fEspSign)} col={C_ESP} size={14} />
              <Readout label="dist. objeto dₒ" value={fmtDist(doEspejo)} col="#fff" size={14} />
              <Readout label="dist. imagen dᵢ" value={fmtDist(rEspejo.di)} col={C_ESP} size={14} />
              <Readout label="aumento M" value={fmtAumento(rEspejo.M)} col={rEspejo.orientacion === "invertida" ? "#fca5a5" : "#86efac"} size={14} />
            </div>
          )}
          {modo === "refraccion" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="índice n₁" value={fmt2(m1.n)} col={m1.color} size={14} />
              <Readout label="índice n₂" value={fmt2(m2.n)} col={m2.color} size={14} />
              <Readout label="ángulo θ₂" value={snell.reflexionTotal ? "—" : fmtAng(snell.thetaRefDeg)} col={snell.reflexionTotal ? "#fca5a5" : C_REF} size={14} />
              <Readout label="ángulo crítico" value={snell.thetaCriticoDeg != null ? fmtAng(snell.thetaCriticoDeg) : "—"} col="#fde047" size={14} />
            </div>
          )}
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

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                </div>
              ))}
            </div>
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
          Física <strong>exacta</strong> de cálculo cerrado: ecuación de las lentes y espejos delgados 1/f = 1/dₒ + 1/dᵢ (óptica paraxial de Gauss), aumento M = −dᵢ/dₒ y ley de Snell n₁·sen θ₁ = n₂·sen θ₂, con el ángulo crítico θ_c = arcsen(n₂/n₁). Los valores de los paneles son <strong>exactos</strong>. El trazado de rayos en pantalla es <strong>esquemático</strong> (construcción paraxial con dos rayos principales): las distancias usan una escala visual y los símbolos de lente/espejo son convencionales. Las instrucciones y las preguntas de reflexión son verbatim de la simulación A2; el ejemplo es la pregunta de comprensión 2 de la lectura A1; las ideas clave y el glosario se basan en la lectura A1.
        </span>
      </div>

      {/* ── Reto evaluable: quiz verbatim CNEYT-V-P06-A4 ───────────────── */}
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
          <FichaTeorica data={OPTICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
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

"use client";

/**
 * Laboratorio 3D — Funciones de 1.º y 2.º grado y sus transformaciones.
 * Práctica experimental para PM-IV-P02-A2 (ejercicio_matematico "Modelo la
 * trayectoria de un balón con una función cuadrática"; progresión 2).
 *
 * El alumno parte de la función PADRE (y = x² o y = x) y la transforma con la
 * forma de vértice f(x) = a(x−h)² + k, viendo en vivo cómo cada parámetro la
 * mueve o deforma:  a estira/refleja,  h traslada horizontal,  k traslada
 * vertical. Con a < 0 la parábola modela la trayectoria de un balón cuyo punto
 * más alto (vértice) está en (h, k). Cálculo exacto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { TRANSFORMACIONES_FICHA } from "./transformaciones-funciones-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import {
  calcFuncion, ecuacion, TRANSFORMACIONES, ESCENARIOS, IDEAS, DATOS,
  A_MIN, A_MAX, A_STEP, A_DEF, H_MIN, H_MAX, H_STEP, H_DEF,
  K_MIN, K_MAX, K_STEP, K_DEF, MODO_DEF,
  fmtNum2, fmtNum1, fmtCoord, fmtPar, type Escenario, type Modo,
  RETO_A2,
} from "./transformaciones-funciones-data";

const TransformacionesFuncionesScene = dynamic(() => import("./TransformacionesFuncionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Graficando la función…</span>
    </div>
  ),
});

const A_COL = "#f97316";   // a (estiramiento/reflexión)
const H_COL = "#34D399";   // h (traslación horizontal)
const K_COL = "#c4b5fd";   // k (traslación vertical)
const VERT_COL = "#f5d36b"; // vértice
const PADRE_COL = "#64748b"; // padre

export function LabTransformacionesFunciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>(MODO_DEF);
  const [a, setA] = useState(A_DEF);
  const [h, setH] = useState(H_DEF);
  const [k, setK] = useState(K_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarPadre, setMostrarPadre] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const dir = useRef(1);

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

  // Barrido automático de h (traslación horizontal): la gráfica completa se
  // desliza de un lado al otro del plano sin deformarse.
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setH((prev) => {
        let next = prev + dt * 0.0024 * dir.current; // ~2.4 u/s
        if (next >= H_MAX) { next = H_MAX; dir.current = -1; }
        else if (next <= H_MIN) { next = H_MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const f = useMemo(() => calcFuncion(modo, a, h, k), [modo, a, h, k]);

  const setAman = (v: number) => { setReproduciendo(false); setA(v); };
  const setHman = (v: number) => { setReproduciendo(false); setH(v); };
  const setKman = (v: number) => { setReproduciendo(false); setK(v); };
  const setModoMan = (m: Modo) => { setReproduciendo(false); setModo(m); if (sonido) audioRef.current?.blip(); bump(); };
  const aplicar = (e: Escenario) => { setReproduciendo(false); setModo(e.modo); setA(e.a); setH(e.h); setK(e.k); if (sonido) audioRef.current?.blip(); bump(); };
  const reset = () => { setReproduciendo(false); setModo(MODO_DEF); setA(A_DEF); setH(H_DEF); setK(K_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  const formaTexto = f.reflejada
    ? (modo === "cuadratica" ? "Abre hacia abajo (a < 0)" : "Recta que baja (a < 0)")
    : (modo === "cuadratica" ? "Abre hacia arriba (a > 0)" : "Recta que sube (a > 0)");

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Transforma la función</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {ecuacion(modo, a, h, k)}; el {modo === "cuadratica" ? "vértice" : "punto ancla"} está en {fmtPar(f.h, f.k)}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseTf { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseTf 1.6s ease-in-out infinite; }
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
        .ex-seg { cursor:pointer; flex:1; padding:9px 12px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:7px; }
        .ex-seg[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.2); color:#fff; }
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
      `}</style>

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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <TransformacionesFuncionesScene
                modo={modo}
                a={a}
                h={h}
                k={k}
                accent={accent}
                mostrarPadre={mostrarPadre}
                autoRotate={autoRotate}
                pausado={false}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{ecuacion(modo, a, h, k)}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={reproduciendo} onClick={() => setReproduciendo((p) => !p)} title={reproduciendo ? "Pausar la traslación" : "Trasladar (mover h)"}>
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

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className="fa-solid fa-location-dot" style={{ color: VERT_COL, marginRight: 7 }} />
                {modo === "cuadratica" ? "Vértice" : "Punto ancla"} en <strong style={{ color: VERT_COL }}>{fmtPar(f.h, f.k)}</strong>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <span style={{ color: A_COL }}>{formaTexto}</span>
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                <span style={{ color: H_COL }}>h = {fmtNum1(f.h)}</span> (traslación horizontal) &nbsp;·&nbsp;
                <span style={{ color: K_COL }}>k = {fmtNum1(f.k)}</span> (traslación vertical) &nbsp;·&nbsp;
                función de <strong>{f.grado}.º grado</strong>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Elige el grado y transforma la gráfica
            </Eyebrow>

            {/* selector de modo */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button className="ex-seg" data-on={modo === "cuadratica"} onClick={() => setModoMan("cuadratica")}>
                <i className="fa-solid fa-square-root-variable" /> Cuadrática (2.º)
              </button>
              <button className="ex-seg" data-on={modo === "lineal"} onClick={() => setModoMan("lineal")}>
                <i className="fa-solid fa-slash" /> Lineal (1.º)
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="a · estira / refleja" icon="fa-up-right-and-down-left-from-center" colr={A_COL}
                valor={fmtNum2(a)} min={A_MIN} max={A_MAX} step={A_STEP} value={a}
                onChange={setAman} hintL={`${A_MIN}`} hintR={`${A_MAX}`} />
              <Deslizador label="h · traslada horizontal →" icon="fa-arrows-left-right" colr={H_COL}
                valor={fmtNum1(h)} min={H_MIN} max={H_MAX} step={H_STEP} value={h}
                onChange={setHman} hintL={`${H_MIN}`} hintR={`${H_MAX}`} />
              <Deslizador label="k · traslada vertical ↑" icon="fa-arrows-up-down" colr={K_COL}
                valor={fmtNum1(k)} min={K_MIN} max={K_MAX} step={K_STEP} value={k}
                onChange={setKman} hintL={`${K_MIN}`} hintR={`${K_MAX}`} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <button className="ex-tog" onClick={() => setMostrarPadre((v) => !v)} style={{ borderColor: mostrarPadre ? `${PADRE_COL}88` : T.line, background: mostrarPadre ? `${PADRE_COL}22` : T.inset, color: mostrarPadre ? "#fff" : T.text2 }}>
                <i className={`fa-solid ${mostrarPadre ? "fa-eye" : "fa-eye-slash"}`} style={{ color: "#94a3b8" }} /> Función padre y flechas
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>SITUACIONES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  data-on={modo === e.modo && Math.abs(a - e.a) < 0.13 && Math.abs(h - e.h) < 0.26 && Math.abs(k - e.k) < 0.26}
                  onClick={() => aplicar(e)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Las tres transformaciones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 8, color: accent }} />
              Qué hace cada parámetro
            </Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {TRANSFORMACIONES.map((tr) => (
                <div key={tr.param} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${tr.color}33`, background: "rgba(4,10,22,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, fontStyle: "italic", color: "#04121f", background: tr.color }}>{tr.param}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{tr.nombre}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{tr.efecto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El razonamiento paso a paso */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-list-ol" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Del padre a la transformada</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 800 }}>{modo === "cuadratica" ? "Parto de y = x²" : "Parto de y = x"}</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              <PasoRow n={1} texto="Función padre (sin transformar):" valor={modo === "cuadratica" ? "y = x²" : "y = x"} col={PADRE_COL} />
              <PasoRow n={2} texto={`Aplico a = ${fmtNum2(a)} (${f.reflejada ? "refleja" : "no refleja"}, ${f.estirada ? "estira" : f.comprimida ? "comprime" : "igual"}):`} valor={modo === "cuadratica" ? `y = ${fmtNum2(a)}·x²` : `y = ${fmtNum2(a)}·x`} col={A_COL} />
              <PasoRow n={3} texto={`Traslado h = ${fmtNum1(h)} en horizontal y k = ${fmtNum1(k)} en vertical:`} valor={ecuacion(modo, a, h, k)} col={H_COL} />
              <PasoRow n={4} texto={modo === "cuadratica" ? "El vértice queda en (h, k):" : "La recta pasa por el punto (h, k):"} valor={fmtPar(f.h, f.k)} col={VERT_COL} />
            </div>
          </div>

          {/* Anatomía */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-vector-square" style={{ marginRight: 8, color: accent }} />
              Anatomía
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <LadoRow label="a · forma" valor={fmtNum2(f.a)} col={A_COL} icon="fa-up-right-and-down-left-from-center" />
              <LadoRow label="h · traslación horizontal" valor={fmtNum1(f.h)} col={H_COL} icon="fa-arrows-left-right" />
              <LadoRow label="k · traslación vertical" valor={fmtNum1(f.k)} col={K_COL} icon="fa-arrows-up-down" />
              {modo === "cuadratica"
                ? <LadoRow label="vértice (h, k)" valor={fmtPar(f.h, f.k)} col={VERT_COL} icon="fa-location-dot" />
                : <LadoRow label="pendiente (= a)" valor={fmtNum2(f.pendiente)} col={VERT_COL} icon="fa-angle-up" />}
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 11 }}>
              <strong style={{ color: A_COL }}>a</strong> cambia la <strong>forma</strong>; <strong style={{ color: H_COL }}>h</strong> y <strong style={{ color: K_COL }}>k</strong> solo cambian la <strong>posición</strong> (deslizan la gráfica sin deformarla).
            </div>
          </div>

          {/* Aplicación: el balón */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-futbol" style={{ marginRight: 8, color: accent }} />
              Aplicación: la trayectoria del balón
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              Una pelota lanzada describe una <strong style={{ color: A_COL }}>parábola con a &lt; 0</strong> (abre hacia abajo). Su punto más alto es el <strong style={{ color: VERT_COL }}>vértice (h, k)</strong>: h es dónde alcanza la cima y k qué tan alto llega. {modo === "cuadratica" && f.reflejada ? `Ahora mismo el balón sube hasta una altura de ${fmtNum1(f.k)} en x = ${fmtNum1(f.h)}.` : "Prueba el escenario «Balón (a<0)» para verlo."}
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
            <Readout label="grado" value={`${f.grado}.º`} col={accent} size={18} />
            <Readout label={modo === "cuadratica" ? "vértice" : "punto"} value={fmtPar(f.h, f.k)} col={VERT_COL} size={15} />
            <Readout label="corta eje Y en" value={fmtCoord(f.ordenadaOrigen)} col={H_COL} size={18} />
            <Readout label="forma" value={f.reflejada ? "↓ refleja" : "↑ normal"} col={A_COL} size={15} />
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

      {/* ── Objetivos ──────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        {[
          { txt: "Identifica la función padre (y = x² o y = x) y sus transformaciones", done: resetNonce > 0 },
          { txt: "Modifica a, h y k para ver el efecto de cada transformación", done: resetNonce > 1 },
          { txt: "Aplica al menos un escenario guiado (balón, recta, etc.)", done: resetNonce > 0 },
          { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
        ].map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#4ade80" : T.text2, marginTop: 10 }}>
            <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
            <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
          </div>
        ))}
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Cálculo <strong>exacto</strong>: la gráfica se evalúa punto por punto con f(x) = a(x−h)² + k (o a(x−h) + k en lineal); el vértice es exactamente (h, k). El plano se dibuja a <strong>escala fija</strong> sobre una rejilla y la curva se <strong>recorta</strong> al rango visible, pero los <strong>valores numéricos</strong> de las etiquetas y lecturas siempre son los exactos.
        </span>
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

      {/* ── Cajón de teoría ──────────────────────────────────────────────── */}
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
          <FichaTeorica data={TRANSFORMACIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Fila de un paso del razonamiento ────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}30` }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Fila de un dato de la anatomía ──────────────────────────────────────── */
function LadoRow({ label, valor, col, icon }: { label: string; valor: string; col: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${col}33` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text2 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
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

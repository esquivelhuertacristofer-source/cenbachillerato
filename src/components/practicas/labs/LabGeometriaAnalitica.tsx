"use client";

/**
 * Laboratorio 3D — Geometría analítica: distancia, punto medio y pendiente entre
 * dos puntos. Práctica experimental para PM-IV-P06-A2 (ejercicio_matematico;
 * progresión 6).
 *
 * El alumno coloca dos puntos P₁ y P₂ en un plano cartesiano flotante y observa
 * cómo se construyen, con los mismos catetos Δx y Δy:
 *   · la DISTANCIA  d = √(Δx² + Δy²)   (Pitágoras, la hipotenusa),
 *   · el PUNTO MEDIO M = ((x₁+x₂)/2, (y₁+y₂)/2),
 *   · la PENDIENTE  m = Δy/Δx           (la inclinación de la recta).
 * Cálculo exacto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { GEOMETRIA_FICHA } from "./geometria-analitica-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import {
  calcGeom, FORMULAS, ESCENARIOS, IDEAS, DATOS,
  MIN, MAX, STEP, X1_DEF, Y1_DEF, X2_DEF, Y2_DEF,
  fmtNum2, fmtInt, fmtPar, fmtPend, RETO_A2, type Escenario,
} from "./geometria-analitica-data";
import { LabSfx } from "./lab-audio";

const GeometriaAnaliticaScene = dynamic(() => import("./GeometriaAnaliticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando el plano cartesiano…</span>
    </div>
  ),
});

const P1_COL = "#60a5fa";   // punto P₁
const P2_COL = "#f5d36b";   // punto P₂
const SEG_COL = "#f97316";  // distancia
const DX_COL = "#34D399";   // Δx
const DY_COL = "#c4b5fd";   // Δy
const MID_COL = "#fb7185";  // punto medio

export function LabGeometriaAnalitica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [x1, setX1] = useState(X1_DEF);
  const [y1, setY1] = useState(Y1_DEF);
  const [x2, setX2] = useState(X2_DEF);
  const [y2, setY2] = useState(Y2_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarTriangulo, setMostrarTriangulo] = useState(true);
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

  // Barrido automático de x₂ (rebota entre los límites): distancia y pendiente
  // cambian a la vista; al cruzar x₁ la recta se vuelve vertical (m indefinida).
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setX2((prev) => {
        let next = prev + dt * 0.0028 * dir.current; // ~2.8 u/s
        if (next >= MAX) { next = MAX; dir.current = -1; }
        else if (next <= MIN) { next = MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const g = useMemo(() => calcGeom(x1, y1, x2, y2), [x1, y1, x2, y2]);

  const setX1man = (v: number) => { setReproduciendo(false); setX1(v); };
  const setY1man = (v: number) => { setReproduciendo(false); setY1(v); };
  const setX2man = (v: number) => { setReproduciendo(false); setX2(v); };
  const setY2man = (v: number) => { setReproduciendo(false); setY2(v); };
  const aplicar = (e: Escenario) => { setReproduciendo(false); setX1(e.x1); setY1(e.y1); setX2(e.x2); setY2(e.y2); bump(); if (sonido) audioRef.current?.blip(); };
  const reset = () => { setReproduciendo(false); setX1(X1_DEF); setY1(Y1_DEF); setX2(X2_DEF); setY2(Y2_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Mide entre dos puntos del plano</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: entre P₁ {fmtPar(g.x1, g.y1)} y P₂ {fmtPar(g.x2, g.y2)} la distancia es d = {fmtNum2(g.dist)}, el punto medio M = {fmtPar(g.mx, g.my)} y la pendiente m = {fmtPend(g)}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseGeo { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseGeo 1.6s ease-in-out infinite; }
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
              <GeometriaAnaliticaScene
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                accent={accent}
                mostrarTriangulo={mostrarTriangulo}
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
              <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>d = {fmtNum2(g.dist)}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={reproduciendo} onClick={() => setReproduciendo((p) => !p)} title={reproduciendo ? "Pausar el barrido de x₂" : "Mover x₂ automáticamente"}>
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

            {/* Pie: las tres lecturas en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13, color: "#eaf0fb", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                d = √(<span style={{ color: DX_COL }}>{fmtNum2(g.dx)}</span>² + <span style={{ color: DY_COL }}>{fmtNum2(g.dy)}</span>²) = <span style={{ color: SEG_COL }}>{fmtNum2(g.dist)}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                <i className="fa-solid fa-crosshairs" style={{ color: MID_COL, marginRight: 7 }} />
                M = <strong>{fmtPar(g.mx, g.my)}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;
                <i className="fa-solid fa-angle-up" style={{ color: "#fbbf24", marginRight: 5 }} />
                m = Δy/Δx = <strong>{fmtPend(g)}</strong>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Coloca los dos puntos en el plano
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Deslizador label="P₁ · x₁" icon="fa-arrows-left-right" colr={P1_COL}
                valor={fmtInt(g.x1)} min={MIN} max={MAX} step={STEP} value={x1}
                onChange={setX1man} hintL={`${MIN}`} hintR={`${MAX}`} />
              <Deslizador label="P₁ · y₁" icon="fa-arrows-up-down" colr={P1_COL}
                valor={fmtInt(g.y1)} min={MIN} max={MAX} step={STEP} value={y1}
                onChange={setY1man} hintL={`${MIN}`} hintR={`${MAX}`} />
              <Deslizador label="P₂ · x₂" icon="fa-arrows-left-right" colr={P2_COL}
                valor={fmtInt(g.x2)} min={MIN} max={MAX} step={STEP} value={x2}
                onChange={setX2man} hintL={`${MIN}`} hintR={`${MAX}`} />
              <Deslizador label="P₂ · y₂" icon="fa-arrows-up-down" colr={P2_COL}
                valor={fmtInt(g.y2)} min={MIN} max={MAX} step={STEP} value={y2}
                onChange={setY2man} hintL={`${MIN}`} hintR={`${MAX}`} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <button className="ex-tog" onClick={() => setMostrarTriangulo((v) => !v)} style={{ borderColor: mostrarTriangulo ? `${DX_COL}88` : T.line, background: mostrarTriangulo ? `${DX_COL}1a` : T.inset, color: mostrarTriangulo ? "#fff" : T.text2 }}>
                <i className={`fa-solid ${mostrarTriangulo ? "fa-eye" : "fa-eye-slash"}`} style={{ color: DX_COL }} /> Triángulo Δx / Δy
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>SITUACIONES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  data-on={g.x1 === e.x1 && g.y1 === e.y1 && g.x2 === e.x2 && g.y2 === e.y2}
                  onClick={() => aplicar(e)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Las tres fórmulas */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-scroll" style={{ marginRight: 8, color: accent }} />
              Las tres fórmulas de la geometría analítica
            </Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {FORMULAS.map((f) => (
                <div key={f.nombre} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${f.color}33`, background: "rgba(4,10,22,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: f.color }} />
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{f.nombre}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: f.color, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>{f.formula}</div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{f.uso}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El cálculo paso a paso */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-calculator" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El cálculo, paso a paso</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 800 }}>De P₁ {fmtPar(g.x1, g.y1)} a P₂ {fmtPar(g.x2, g.y2)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              <PasoRow n={1} texto="Calculo los catetos Δx y Δy:" valor={`Δx = ${fmtNum2(g.dx)},  Δy = ${fmtNum2(g.dy)}`} col={DX_COL} />
              <PasoRow n={2} texto="Distancia (Pitágoras):" valor={`d = √(${fmtNum2(g.dx)}² + ${fmtNum2(g.dy)}²) = ${fmtNum2(g.dist)}`} col={SEG_COL} />
              <PasoRow n={3} texto="Punto medio (promedio de coordenadas):" valor={`M = ${fmtPar(g.mx, g.my)}`} col={MID_COL} />
              <PasoRow n={4} texto="Pendiente (inclinación):" valor={g.pendienteDef ? `m = ${fmtNum2(g.dy)} / ${fmtNum2(g.dx)} = ${fmtPend(g)}` : "m = Δy / 0 → indefinida (recta vertical)"} col="#fbbf24" />
            </div>
          </div>

          {/* Anatomía */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-vector-square" style={{ marginRight: 8, color: accent }} />
              Anatomía
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <LadoRow label="Cateto Δx (horizontal)" valor={fmtNum2(g.dx)} col={DX_COL} icon="fa-arrows-left-right" />
              <LadoRow label="Cateto Δy (vertical)" valor={fmtNum2(g.dy)} col={DY_COL} icon="fa-arrows-up-down" />
              <LadoRow label="Distancia (hipotenusa)" valor={fmtNum2(g.dist)} col={SEG_COL} icon="fa-ruler-combined" />
              <LadoRow label="Pendiente m" valor={fmtPend(g)} col="#fbbf24" icon="fa-angle-up" />
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 11 }}>
              Los <strong style={{ color: DX_COL }}>mismos catetos</strong> Δx y Δy sirven para todo: la <strong style={{ color: SEG_COL }}>distancia</strong> es su hipotenusa y la <strong style={{ color: "#fbbf24" }}>pendiente</strong> es Δy entre Δx.
            </div>
          </div>

          {/* Distancia = Pitágoras */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
              La distancia es Pitágoras
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              El segmento P₁P₂ es la <strong style={{ color: SEG_COL }}>hipotenusa</strong> de un triángulo rectángulo cuyos catetos son Δx y Δy. Por eso d = √(Δx² + Δy²) <em>es</em> el Teorema de Pitágoras. {Math.abs(g.dx) < 0.05 ? "Ahora Δx = 0: la recta es vertical y la pendiente queda indefinida." : (Math.abs(g.dy) < 0.05 ? "Ahora Δy = 0: la recta es horizontal y la pendiente vale 0." : "Mueve los puntos y observa cómo cambian los tres a la vez.")}
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
            <Readout label="distancia d" value={fmtNum2(g.dist)} col={SEG_COL} size={18} />
            <Readout label="punto medio M" value={fmtPar(g.mx, g.my)} col={MID_COL} size={15} />
            <Readout label="pendiente m" value={fmtPend(g)} col="#fbbf24" size={18} />
            <Readout label="inclinación" value={`${fmtNum2(g.anguloDeg)}°`} col={accent} size={18} />
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Mueve P₁ y P₂ sobre el plano cartesiano", done: true },
            { txt: "Observa la distancia como hipotenusa (Pitágoras)", done: true },
            { txt: "Identifica el punto medio entre dos puntos", done: true },
            { txt: "Calcula e interpreta la pendiente de la recta", done: true },
            { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#4ADE80" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Cálculo <strong>exacto</strong>: la distancia sale de d = √(Δx² + Δy²), el punto medio del promedio de coordenadas y la pendiente de m = Δy/Δx (indefinida cuando Δx = 0, recta vertical). El plano se dibuja a <strong>escala fija</strong> sobre una rejilla, así que las posiciones son reales; los <strong>valores numéricos</strong> de las etiquetas y lecturas siempre son los exactos.
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
          <FichaTeorica data={GEOMETRIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
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

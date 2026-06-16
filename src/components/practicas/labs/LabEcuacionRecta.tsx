"use client";

/**
 * Laboratorio 3D — Ecuación de la recta en el plano cartesiano.
 * Práctica experimental para PM-III-P10-A2
 * ("Grafico la ecuación de la recta y sus soluciones"; progresión 2 / O2).
 *
 * Una ecuación lineal con DOS incógnitas se DIBUJA como una RECTA en el plano
 * cartesiano. La forma pendiente–ordenada y = m·x + b da sentido geométrico a
 * cada número: la PENDIENTE m es la inclinación (sube/baja por cada paso en x),
 * la ORDENADA b es donde cruza el eje Y (0, b) y la RAÍZ es donde cruza X. Cada
 * punto de la recta es una solución: una ecuación con dos incógnitas tiene
 * infinitas soluciones. El alumno mueve m y b y ve cómo gira y se desplaza la
 * recta. Pensamiento Matemático III — relación álgebra↔geometría (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { ECUACION_RECTA_FICHA } from "./ecuacion-recta-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import {
  DEFAULTS,
  TAXI,
  evalY,
  raizX,
  solucionesEnteras,
  sentido,
  fmtNum,
  fmtRecta,
  fmtEstandar,
  M_MIN, M_MAX, M_STEP, B_MIN, B_MAX, B_STEP,
  RETO_A2,
} from "./ecuacion-recta-data";
import { LabSfx } from "./lab-audio";

const EcuacionRectaScene = dynamic(() => import("./EcuacionRectaScene"), {
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
const CIAN = "#7fd4ff";

export function LabEcuacionRecta({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [m, setM] = useState(DEFAULTS.m);
  const [b, setB] = useState(DEFAULTS.b);
  const [showTriangulo, setShowTriangulo] = useState(true);
  const [showSoluciones, setShowSoluciones] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, cajón de teoría y sonido
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

  // objetivos
  const [vioOrdenada] = useState(true);
  const [movioM, setMovioM] = useState(false);
  const [movioB, setMovioB] = useState(false);
  const [vioSoluciones, setVioSoluciones] = useState(true);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarM = (v: number) => { setM(v); setMovioM(true); if (sonido) audioRef.current?.blip(); };
  const cambiarB = (v: number) => { setB(v); setMovioB(true); if (sonido) audioRef.current?.blip(); };
  const toggleTriangulo = () => { setShowTriangulo((t) => !t); if (sonido) audioRef.current?.blip(); };
  const toggleSoluciones = () => { setShowSoluciones((s) => !s); setVioSoluciones(true); if (sonido) audioRef.current?.blip(); };

  const reset = () => {
    setM(DEFAULTS.m); setB(DEFAULTS.b);
    setShowTriangulo(true); setShowSoluciones(true);
    bump();
  };

  // magnitudes matemáticas (deterministas)
  const xr = useMemo(() => raizX(m, b), [m, b]);
  const sols = useMemo(() => solucionesEnteras(m, b), [m, b]);
  const recta = useMemo(() => fmtRecta(m, b), [m, b]);
  const estandar = useMemo(() => fmtEstandar(m, b), [m, b]);
  const dir = useMemo(() => sentido(m), [m]);

  const raizTxt = xr === null ? "no cruza el eje X" : `x = ${fmtNum(xr, 2)}`;
  const dirTxt = dir === "sube" ? "la recta SUBE" : dir === "baja" ? "la recta BAJA" : "la recta es HORIZONTAL";

  // escenario del taxi: costo y = 1.07·x + 8.74 a una distancia dada (en cientos de metros)
  const taxiX = 30; // 30 × 100 m = 3 km
  const costoTaxi = useMemo(() => evalY(TAXI.m, TAXI.b, taxiX), []);

  const objetivos = [
    { txt: "Identifica la ordenada al origen (0, b)", done: vioOrdenada },
    { txt: "Gira la recta moviendo la pendiente m", done: movioM },
    { txt: "Desliza la recta moviendo b", done: movioB },
    { txt: "Observa que hay muchas soluciones", done: vioSoluciones },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Una ecuación lineal se dibuja como una recta</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: y = m·x + b traza una recta en el plano cartesiano. La pendiente m la inclina y la ordenada b la corre arriba o abajo; cada punto de la recta es una solución.
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
        .ex-toggrid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
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
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <EcuacionRectaScene
                m={m}
                b={b}
                accent={accent}
                showTriangulo={showTriangulo}
                showSoluciones={showSoluciones}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-chart-line" style={{ marginRight: 8 }} />
                {recta}
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
                <strong style={{ color: ORO }}>Ordenada</strong> en (0, {fmtNum(b, 1)}) · <strong style={{ color: CIAN }}>raíz</strong> {raizTxt} · <strong style={{ color: accent }}>pendiente</strong> m = {fmtNum(m, 2)} ({dir})
              </div>
            </div>
          </div>

          {/* Controles: coeficientes */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Mueve los números de y = m·x + b
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Deslizador label="Pendiente (m)" icon="fa-angle-up" colr={accent}
                valor={fmtNum(m, 2)} min={M_MIN} max={M_MAX} step={M_STEP} value={m} onChange={cambiarM}
                hintL="negativa: baja" hintR="positiva: sube" />
              <Deslizador label="Ordenada al origen (b)" icon="fa-arrows-up-down" colr={ORO}
                valor={fmtNum(b, 1)} min={B_MIN} max={B_MAX} step={B_STEP} value={b} onChange={cambiarB}
                hintL="corre la recta hacia abajo" hintR="hacia arriba" />
            </div>

            <div className="ex-toggrid" style={{ marginTop: 18 }}>
              <button className="ex-golbtn" data-on={showTriangulo} onClick={toggleTriangulo} style={{ ["--exc" as string]: accent }}>
                <i className="fa-solid fa-ruler-combined" style={{ fontSize: 15, color: showTriangulo ? accent : T.text3 }} />
                {showTriangulo ? "Ocultar pendiente" : "Triángulo de pendiente"}
              </button>
              <button className="ex-golbtn" data-on={showSoluciones} onClick={toggleSoluciones} style={{ ["--exc" as string]: accent }}>
                <i className="fa-solid fa-braille" style={{ fontSize: 15, color: showSoluciones ? accent : T.text3 }} />
                {showSoluciones ? "Ocultar soluciones" : "Mostrar soluciones"}
              </button>
            </div>
          </div>

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-square-root-variable" style={{ marginRight: 8, color: accent }} />
              Las partes de la recta
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label="Ordenada al origen" value={`(0, ${fmtNum(b, 1)})`} col={ORO} size={15} />
              <Readout label="Pendiente (m)" value={fmtNum(m, 2)} col={accent} size={16} />
              <Readout label="Raíz (cruce con X)" value={raizTxt} col={CIAN} size={14} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Forma con dos incógnitas" value={estandar} col={VERDE} size={13} />
              <Readout label="Soluciones enteras visibles" value={`${sols.length}`} col={VERDE} size={16} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              Con <strong style={{ color: accent }}>m = {fmtNum(m, 2)}</strong>, {dirTxt}: por cada paso de <strong>1</strong> en x, y cambia <strong style={{ color: accent }}>{fmtNum(m, 2)}</strong>. La <strong style={{ color: ORO }}>ordenada b = {fmtNum(b, 1)}</strong> dice dónde cruza el eje Y. Cada punto verde es una <strong style={{ color: VERDE }}>solución</strong> de la ecuación: por eso una ecuación con dos incógnitas tiene <strong>infinitas</strong> soluciones.
            </div>

            {/* Escenario del taxi — modelo lineal real */}
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 7 }}>
                <i className="fa-solid fa-taxi" style={{ marginRight: 7, color: accent }} />
                Una recta en la vida real: la tarifa del taxi
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 9 }}>
                <Readout label="Banderazo (ordenada b)" value={fmtNum(TAXI.b, 2)} unit="$" col={ORO} size={15} />
                <Readout label="Por cada 100 m (pendiente m)" value={fmtNum(TAXI.m, 2)} unit="$" col={accent} size={15} />
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                El costo es <strong style={{ color: accent, fontFamily: "ui-monospace, monospace" }}>y = {fmtNum(TAXI.m, 2)}·x + {fmtNum(TAXI.b, 2)}</strong>. A x = 0 (sin avanzar) ya cobra el <strong style={{ color: ORO }}>banderazo</strong>; en un viaje de <strong>3 km</strong> (x = {taxiX}) el costo es <strong style={{ color: VERDE, fontFamily: "ui-monospace, monospace" }}>${fmtNum(costoTaxi, 2)}</strong>. La ordenada es lo fijo; la pendiente, lo que sube por distancia.
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Del álgebra a la geometría</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La ecuación <strong style={{ color: T.text }}>y = m·x + b</strong> y la <strong style={{ color: accent }}>recta</strong> son lo mismo visto de dos formas. Una <strong>ecuación con dos incógnitas</strong> (x, y) no tiene una sola respuesta: tiene <em>todas</em> las parejas (x, y) que caen sobre la recta.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Las partes</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={accent} icon="fa-angle-up" titulo="Pendiente (m)">
              La inclinación: cuánto sube o baja y por cada paso de 1 en x (m = subida ÷ avance). m &gt; 0 sube, m &lt; 0 baja, m = 0 es horizontal.
            </Parte>
            <Parte col={ORO} icon="fa-arrows-up-down" titulo="Ordenada al origen (b)">
              El punto (0, b) donde la recta cruza el eje Y. Cambiar b corre la recta arriba o abajo sin girarla.
            </Parte>
            <Parte col={CIAN} icon="fa-arrows-left-right-to-line" titulo="Raíz (x = −b/m)">
              Donde la recta cruza el eje X (y = 0). Una recta horizontal (m = 0) no tiene raíz.
            </Parte>
            <Parte col={VERDE} icon="fa-braille" titulo="Soluciones (los puntos)">
              Cada punto de la recta es un par (x, y) que cumple la ecuación: hay infinitas soluciones.
            </Parte>
          </div>

          <div className="ex-divider" />

          <Eyebrow>El plano cartesiano</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Dos ejes <strong style={{ color: T.text }}>perpendiculares</strong> —horizontal <strong>(X)</strong> y vertical <strong>(Y)</strong>— se cruzan en el <strong>origen (0, 0)</strong> y dividen el plano en cuatro <strong>cuadrantes</strong>. Cada punto se nombra con un par ordenado (x, y): primero cuánto a la derecha/izquierda, luego cuánto arriba/abajo.
          </div>

          <div className="ex-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Una recta modela <strong>todo lo que crece a ritmo constante</strong>: la tarifa de un taxi de la CDMX (banderazo + costo por distancia), el recibo de luz de CFE (cargo fijo + consumo), el saldo de un ahorro semanal, o la distancia de un autobús a velocidad constante. La <strong>ordenada</strong> es el punto de partida; la <strong>pendiente</strong>, el ritmo.
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
            Empieza con la recta por defecto <strong style={{ color: accent }}>y = 0.5x + 1</strong>: cruza Y en <strong style={{ color: ORO }}>(0, 1)</strong> y sube media unidad por cada paso. Luego sube <strong>m</strong> para inclinarla más, o mueve <strong>b</strong> para deslizarla sin girarla.
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
          <FichaTeorica data={ECUACION_RECTA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
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
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
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

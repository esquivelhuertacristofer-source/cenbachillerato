"use client";

/**
 * Laboratorio 3D — Teorema Fundamental del Cálculo.
 * Práctica experimental para PM-V-P10-A2
 * ("Aproximo el área bajo una curva y la conecto con la antiderivada";
 *  progresión 8 / propósito formativo O8).
 *
 * El alumno elige una función f y la integra geométricamente: con el modo ÁREA
 * aproxima ∫₀ᵇ f con rectángulos de Riemann (a más rectángulos, más se pegan al
 * área exacta); con ACUMULACIÓN ve cómo F(x) = ∫₀ˣ f acumula esa área; y con
 * CONEXIÓN comprueba el Teorema Fundamental del Cálculo: la pendiente de F en b
 * es justo la altura f(b), es decir F′(x) = f(x). Pensamiento Matemático V —
 * «Cálculo diferencial», propósito formativo 8 (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { TFC_FICHA } from "./teorema-fundamental-calculo-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./teorema-fundamental-calculo-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES,
  FUNCION_DEFAULT,
  funcionPorId,
  sumaRiemann,
  integralExacta,
  errorRelativo,
  MODOS,
  A_FIJO,
  XMAX,
  B_DEFAULT,
  N_DEFAULT,
  N_MIN,
  N_MAX,
  fmtNum,
  type Modo,
} from "./tfc-data";

const TfcScene = dynamic(() => import("./TfcScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-area fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const CIAN = "#7fd4ff";
const MAGENTA = "#f0a6ff";

export function LabTfc({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcionId, setFuncionId] = useState(FUNCION_DEFAULT);
  const [modo, setModo] = useState<Modo>("area");
  const [b, setB] = useState(B_DEFAULT);
  const [n, setN] = useState(N_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

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

  // objetivos
  const [cambioFuncion, setCambioFuncion] = useState(false);
  const [refinoRiemann, setRefinoRiemann] = useState(false);
  const [vioAcumulacion, setVioAcumulacion] = useState(false);
  const [vioConexion, setVioConexion] = useState(false);

  const bump = () => setResetNonce((k) => k + 1);

  const elegir = (id: string) => { setFuncionId(id); setCambioFuncion(true); if (sonido) audioRef.current?.blip(); };
  const elegirModo = (m: Modo) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "acumulacion") setVioAcumulacion(true);
    if (m === "conexion") setVioConexion(true);
  };
  const cambiarN = (v: number) => { setN(v); if (v >= 16) setRefinoRiemann(true); };

  const reset = () => {
    setFuncionId(FUNCION_DEFAULT);
    setModo("area"); setB(B_DEFAULT); setN(N_DEFAULT);
    bump();
  };

  // magnitudes matemáticas (deterministas)
  const fn = useMemo(() => funcionPorId(funcionId), [funcionId]);
  const suma = useMemo(() => sumaRiemann(fn, A_FIJO, b, n), [fn, b, n]);
  const exacta = useMemo(() => integralExacta(fn, A_FIJO, b), [fn, b]);
  const err = useMemo(() => errorRelativo(fn, A_FIJO, b, n), [fn, b, n]);
  const fb = fn.f(b);

  const modoActual = MODOS.find((m) => m.id === modo) ?? MODOS[0]!;

  const objetivos = [
    { txt: "Integra una función del catálogo", done: cambioFuncion },
    { txt: "Refina la suma de Riemann (≥16 rect.)", done: refinoRiemann },
    { txt: "Observa la función de acumulación", done: vioAcumulacion },
    { txt: "Verifica F′(x) = f(x) (el TFC)", done: vioConexion },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-area" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La integral es el área bajo la curva</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: ∫ₐᵇ f es el área entre la curva y el eje X. Si F es una antiderivada de f, ese área vale F(b) − F(a), y derivar la acumulación devuelve f: ese es el Teorema Fundamental del Cálculo.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tfcPulse { 0%,100%{ box-shadow:0 0 0 0 var(--tfc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .tfc-live-dot { animation: tfcPulse 1.6s ease-in-out infinite; }
        .tfc-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .tfc-grid { grid-template-columns: 1fr; } }
        .tfc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tfc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .tfc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .tfc-divider { height:1px; background:${T.line}; margin:18px 0; }
        .tfc-catgrid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
        .tfc-catbtn { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px;
          padding:9px 11px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; transition:all .15s; }
        .tfc-catbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .tfc-catbtn[data-on="true"] { border-color:var(--tfc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--tfc); }
        .tfc-modgrid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; }
        @media (max-width: 560px){ .tfc-modgrid { grid-template-columns: 1fr; } }
        .tfc-modbtn { cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; transition:all .15s; }
        .tfc-modbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .tfc-modbtn[data-on="true"] { border-color:var(--tfc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--tfc); }
        .tfc-slider { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px;
          background:${T.inset}; outline:none; cursor:pointer; }
        .tfc-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%;
          background:var(--tfc); border:2px solid #061528; box-shadow:0 2px 8px -2px var(--tfc); cursor:pointer; }
        .tfc-slider::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:var(--tfc); border:2px solid #061528; cursor:pointer; }
        @media (max-width: 1000px){ .tfc-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .tfc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .tfc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .tfc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .tfc-drawer[data-open="true"] { transform:translateX(0); }
        .tfc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .tfc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .tfc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .tfc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .tfc-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .tfc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      <div className="tfc-grid">
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
              <TfcScene
                funcionId={funcionId}
                accent={accent}
                modo={modo}
                b={b}
                n={n}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="tfc-live-dot" style={{ ["--tfc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-chart-area" style={{ marginRight: 8 }} />
                ∫₀ᵇ {fn.formula.replace("f(x) = ", "")} dx
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="tfc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="tfc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="tfc-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="tfc-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="tfc-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="tfc-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura del modo actual */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 640 }}>
                <strong style={{ color: ORO }}>Σ Riemann</strong> {fmtNum(suma, 2)} · <strong style={{ color: VERDE }}>∫₀ᵇf = F(b)</strong> {fmtNum(exacta, 2)} · <strong style={{ color: MAGENTA }}>error</strong> {fmtNum(err, 1)} %
              </div>
            </div>
          </div>

          {/* Controles: modo + sliders */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              ¿Qué quieres explorar?
            </Eyebrow>
            <div className="tfc-modgrid">
              {MODOS.map((m) => (
                <button
                  key={m.id}
                  className="tfc-modbtn"
                  data-on={modo === m.id}
                  onClick={() => elegirModo(m.id)}
                  style={{ ["--tfc" as string]: accent }}
                >
                  <i className={`fa-solid ${m.icon}`} style={{ fontSize: 17, color: modo === m.id ? accent : T.text3 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: modo === m.id ? accent : T.text }}>{m.nombre}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 10 }}>{modoActual.desc}</div>

            {/* Slider del límite b */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>
                  <i className="fa-solid fa-arrows-left-right" style={{ marginRight: 7, color: MAGENTA }} />
                  Límite superior b
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: MAGENTA, fontFamily: "ui-monospace, monospace" }}>{fmtNum(b, 2)}</span>
              </div>
              <input
                className="tfc-slider"
                type="range"
                min={0.5}
                max={XMAX}
                step={0.25}
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                style={{ ["--tfc" as string]: MAGENTA }}
              />
            </div>

            {/* Slider del nº de rectángulos */}
            <div style={{ marginTop: 16, opacity: modo === "area" ? 1 : 0.45 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>
                  <i className="fa-solid fa-grip-lines-vertical" style={{ marginRight: 7, color: ORO }} />
                  Rectángulos de Riemann n
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: ORO, fontFamily: "ui-monospace, monospace" }}>{n}</span>
              </div>
              <input
                className="tfc-slider"
                type="range"
                min={N_MIN}
                max={N_MAX}
                step={1}
                value={n}
                onChange={(e) => cambiarN(Number(e.target.value))}
                disabled={modo !== "area"}
                style={{ ["--tfc" as string]: ORO }}
              />
            </div>
          </div>

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              Integral de {fn.formula} en [0, {fmtNum(b, 2)}]
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label={`Suma de Riemann (n=${n})`} value={fmtNum(suma, 2)} col={ORO} size={15} />
              <Readout label="Integral exacta F(b)−F(a)" value={fmtNum(exacta, 2)} col={VERDE} size={15} />
              <Readout label="Error de aproximación" value={`${fmtNum(err, 1)} %`} col={MAGENTA} size={15} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <Readout label="Antiderivada usada" value={fn.antiderivada} col={CIAN} size={13} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{fn.significado}</div>

            {/* Bloque del TFC — el corazón del propósito O8 */}
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 7 }}>
                <i className="fa-solid fa-link" style={{ marginRight: 7, color: accent }} />
                El Teorema Fundamental del Cálculo
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                La función de acumulación <strong style={{ color: VERDE }}>F(x) = ∫₀ˣ f</strong> mide el área bajo f hasta x. Su altura aquí en b vale <strong style={{ color: VERDE }}>{fmtNum(exacta, 2)}</strong>, justo el área sombreada. Y su <strong style={{ color: ORO }}>pendiente</strong> en b es <strong style={{ color: ORO }}>{fmtNum(fb, 2)}</strong> = f(b): derivar la acumulación devuelve la función original, <strong style={{ color: accent }}>F′(x) = f(x)</strong>. Esa es la conexión entre derivar e integrar.
              </div>
            </div>
          </div>

          {/* Catálogo de funciones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shapes" style={{ marginRight: 8, color: accent }} />
              Elige una función para integrar
            </Eyebrow>
            <div className="tfc-catgrid">
              {FUNCIONES.map((f) => (
                <button
                  key={f.id}
                  className="tfc-catbtn"
                  data-on={funcionId === f.id}
                  onClick={() => elegir(f.id)}
                  style={{ ["--tfc" as string]: accent }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 900, color: funcionId === f.id ? accent : T.text, fontFamily: "ui-monospace, monospace" }}>{f.formula}</span>
                  <span style={{ fontSize: 11, color: T.text3 }}>{f.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Qué es integrar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            <strong style={{ color: T.text }}>Integrar</strong> una función es medir el <strong style={{ color: accent }}>área bajo su curva</strong>. La integral definida <strong>∫ₐᵇ f(x) dx</strong> es esa área entre x = a y x = b. Si f es un ritmo de cambio (velocidad, caudal, potencia), su área es el total acumulado (distancia, volumen, energía).
          </div>

          <div className="tfc-divider" />

          <Eyebrow>Las ideas a leer</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={ORO} icon="fa-grip-lines-vertical" titulo="Sumas de Riemann">
              Partimos [a, b] en n rectángulos; su suma aproxima el área. Sube n y mira cómo el error se acerca a cero.
            </Parte>
            <Parte col={VERDE} icon="fa-layer-group" titulo="Función de acumulación">
              F(x) = ∫₀ˣ f acumula el área desde 0 hasta x: dice cuánto cambio se ha sumado hasta ese punto.
            </Parte>
            <Parte col={ORO} icon="fa-link" titulo="El Teorema Fundamental">
              Derivar la acumulación devuelve la función: F′(x) = f(x). Y por eso ∫ₐᵇ f = F(b) − F(a).
            </Parte>
            <Parte col={CIAN} icon="fa-rotate" titulo="Operaciones inversas">
              Integrar y derivar se deshacen mutuamente, como sumar y restar o elevar al cuadrado y la raíz.
            </Parte>
          </div>

          <div className="tfc-divider" />

          <Eyebrow>De Riemann a la integral</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Con pocos rectángulos la suma <strong style={{ color: ORO }}>sobra o falta</strong> respecto al área real. Al usar cada vez más rectángulos —más delgados— la suma de Riemann se <strong style={{ color: T.text }}>pega</strong> al valor exacto: ese límite es la integral definida. El TFC nos da un atajo: en vez de sumar infinitos rectángulos, basta evaluar la antiderivada en los extremos.
          </div>

          <div className="tfc-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            El área bajo una gráfica <strong>velocidad–tiempo</strong> es la distancia de un viaje Puebla–CDMX; bajo el <strong>caudal</strong> del Cutzamala, el volumen de agua que llega a la CDMX; bajo la <strong>potencia eléctrica</strong>, la energía en kWh que cobra la CFE; bajo la <strong>tasa de lluvia</strong>, el agua acumulada en una presa. Integrar es sumar un cambio continuo, y el TFC garantiza que derivar esa suma devuelve el ritmo original.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="tfc-bottom">
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
            Para el ejercicio de A2 elige <strong style={{ color: accent }}>f(x) = 2x</strong> (la velocidad v = 2t) y lleva <strong>b = 4</strong>: el área es <strong style={{ color: VERDE }}>16</strong> (∫₀⁴ 2t dt = [t²]₀⁴ = 16). En modo «conexión» verás que la pendiente de F en b vale 2b = f(b): el TFC en acción.
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
      <div className="tfc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="tfc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="tfc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="tfc-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="tfc-drawer-body">
          <FichaTeorica data={TFC_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
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

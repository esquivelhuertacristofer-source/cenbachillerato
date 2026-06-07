"use client";

/**
 * Laboratorio 3D — Funciones de variable real y su simetría.
 * Práctica experimental para PM-V-P09-A2
 * ("Grafico funciones de variable real e identifico sus simetrías";
 *  progresión 3 / propósito formativo O3).
 *
 * El alumno elige una función de un catálogo y la ve graficada en el plano
 * cartesiano. Marca sus RASGOS —raíces, intersección con Y, máximos y mínimos
 * locales— y analiza su SIMETRÍA: al reflejar la curva descubre si es PAR
 * (espejo en el eje Y, f(−x) = f(x)), IMPAR (giro de 180° en el origen,
 * f(−x) = −f(x)) o NINGUNA. Pensamiento Matemático V — «Cálculo diferencial»,
 * propósito formativo 3 (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  FUNCIONES,
  FUNCION_DEFAULT,
  funcionPorId,
  raices,
  interseccionY,
  extremos,
  simetria,
  simetriaTexto,
  raicesTexto,
  fmtNum,
} from "./funciones-data";

const FuncionesScene = dynamic(() => import("./FuncionesScene"), {
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
const MAGENTA = "#f0a6ff";

export function LabFunciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcionId, setFuncionId] = useState(FUNCION_DEFAULT);
  const [showSimetria, setShowSimetria] = useState(true);
  const [showRasgos, setShowRasgos] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [cambioFuncion, setCambioFuncion] = useState(false);
  const [vioRasgos, setVioRasgos] = useState(true);
  const [vioSimetria, setVioSimetria] = useState(true);
  const [vioImpar, setVioImpar] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);

  const elegir = (id: string) => {
    setFuncionId(id);
    setCambioFuncion(true);
    if (simetria(funcionPorId(id)) === "impar") setVioImpar(true);
  };
  const toggleSimetria = () => { setShowSimetria((s) => !s); setVioSimetria(true); };
  const toggleRasgos = () => { setShowRasgos((s) => !s); setVioRasgos(true); };

  const reset = () => {
    setFuncionId(FUNCION_DEFAULT);
    setShowSimetria(true); setShowRasgos(true);
    bump();
  };

  // magnitudes matemáticas (deterministas)
  const fn = useMemo(() => funcionPorId(funcionId), [funcionId]);
  const rs = useMemo(() => raices(fn), [fn]);
  const iy = useMemo(() => interseccionY(fn), [fn]);
  const exs = useMemo(() => extremos(fn), [fn]);
  const sim = useMemo(() => simetria(fn), [fn]);

  const maxs = exs.filter((e) => e.tipo === "max");
  const mins = exs.filter((e) => e.tipo === "min");
  const extremosTxt =
    exs.length === 0
      ? "ninguno (no cambia de sentido)"
      : [
          maxs.length ? `máx en ${maxs.map((e) => `(${fmtNum(e.x, 1)}, ${fmtNum(e.y, 1)})`).join(", ")}` : "",
          mins.length ? `mín en ${mins.map((e) => `(${fmtNum(e.x, 1)}, ${fmtNum(e.y, 1)})`).join(", ")}` : "",
        ].filter(Boolean).join(" · ");

  const simColor = sim === "par" ? ORO : sim === "impar" ? CIAN : "#ff7a7a";
  const simEtiqueta = sim === "par" ? "PAR" : sim === "impar" ? "IMPAR" : "NINGUNA";

  const objetivos = [
    { txt: "Grafica una función del catálogo", done: cambioFuncion },
    { txt: "Localiza sus raíces y su corte con Y", done: vioRasgos },
    { txt: "Analiza si es par, impar o ninguna", done: vioSimetria },
    { txt: "Encuentra una función impar", done: vioImpar },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Cada función tiene su forma en el plano</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la gráfica de y = f(x) es el conjunto de puntos (x, f(x)). En ella se leen sus raíces, su corte con Y, sus máximos y mínimos, y su simetría (par, impar o ninguna).
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes fnPulse { 0%,100%{ box-shadow:0 0 0 0 var(--fnc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .fn-live-dot { animation: fnPulse 1.6s ease-in-out infinite; }
        .fn-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .fn-grid { grid-template-columns: 1fr; } }
        .fn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .fn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .fn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .fn-divider { height:1px; background:${T.line}; margin:18px 0; }
        .fn-catgrid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
        .fn-catbtn { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px;
          padding:9px 11px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; transition:all .15s; }
        .fn-catbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .fn-catbtn[data-on="true"] { border-color:var(--fnc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--fnc); }
        .fn-golbtn { cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:9px;
          padding:12px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2};
          font-size:13px; font-weight:800; transition:all .15s; }
        .fn-golbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .fn-golbtn[data-on="true"] { border-color:var(--fnc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--fnc); }
        .fn-toggrid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
        @media (max-width: 1000px){ .fn-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="fn-grid">
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
              <FuncionesScene
                funcionId={funcionId}
                accent={accent}
                showSimetria={showSimetria}
                showRasgos={showRasgos}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="fn-live-dot" style={{ ["--fnc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-chart-line" style={{ marginRight: 8 }} />
                {fn.formula}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="fn-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="fn-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="fn-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura de rasgos */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 600 }}>
                <strong style={{ color: VERDE }}>raíces</strong> {raicesTexto(rs)} · <strong style={{ color: ORO }}>corte Y</strong> (0, {fmtNum(iy, 1)}) · <strong style={{ color: simColor }}>{simEtiqueta}</strong>
              </div>
            </div>
          </div>

          {/* Catálogo de funciones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shapes" style={{ marginRight: 8, color: accent }} />
              Elige una función para graficar
            </Eyebrow>
            <div className="fn-catgrid">
              {FUNCIONES.map((f) => (
                <button
                  key={f.id}
                  className="fn-catbtn"
                  data-on={funcionId === f.id}
                  onClick={() => elegir(f.id)}
                  style={{ ["--fnc" as string]: accent }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 900, color: funcionId === f.id ? accent : T.text, fontFamily: "ui-monospace, monospace" }}>{f.formula}</span>
                  <span style={{ fontSize: 11, color: T.text3 }}>{f.nombre} · {f.tipo}</span>
                </button>
              ))}
            </div>

            <div className="fn-toggrid" style={{ marginTop: 16 }}>
              <button className="fn-golbtn" data-on={showSimetria} onClick={toggleSimetria} style={{ ["--fnc" as string]: accent }}>
                <i className="fa-solid fa-arrows-left-right-to-line" style={{ fontSize: 15, color: showSimetria ? accent : T.text3 }} />
                {showSimetria ? "Ocultar simetría" : "Analizar simetría"}
              </button>
              <button className="fn-golbtn" data-on={showRasgos} onClick={toggleRasgos} style={{ ["--fnc" as string]: accent }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: 15, color: showRasgos ? accent : T.text3 }} />
                {showRasgos ? "Ocultar rasgos" : "Mostrar rasgos"}
              </button>
            </div>
          </div>

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              Los rasgos de {fn.formula}
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label="Raíces (cruces con X)" value={raicesTexto(rs)} col={VERDE} size={14} />
              <Readout label="Intersección con Y" value={`(0, ${fmtNum(iy, 1)})`} col={ORO} size={15} />
              <Readout label="Simetría" value={simEtiqueta} col={simColor} size={15} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <Readout label="Máximos y mínimos locales" value={extremosTxt} col={MAGENTA} size={13} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              {fn.nota} <strong style={{ color: simColor }}>{simetriaTexto(sim)}</strong>
            </div>

            {/* Bloque de simetría — el corazón del propósito O3 */}
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 7 }}>
                <i className="fa-solid fa-shield-halved" style={{ marginRight: 7, color: accent }} />
                ¿Qué dice la simetría?
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                Una función es <strong style={{ color: ORO }}>PAR</strong> si su gráfica es un <strong>espejo respecto al eje Y</strong> (f(−x) = f(x)); es <strong style={{ color: CIAN }}>IMPAR</strong> si gira <strong>180° alrededor del origen</strong> (f(−x) = −f(x)). Activa «Analizar simetría»: si es par o impar, la curva punteada se <strong>encima</strong> a la sólida; si no hay simetría, el reflejo <strong style={{ color: "#ff7a7a" }}>no coincide</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Qué es una función</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Una <strong style={{ color: T.text }}>función de variable real</strong> asigna a cada número <strong>x</strong> un único valor <strong>y = f(x)</strong>. Su <strong style={{ color: accent }}>gráfica</strong> es el conjunto de todos los puntos (x, f(x)) en el plano cartesiano: una imagen donde se leen todos sus comportamientos de un vistazo.
          </div>

          <div className="fn-divider" />

          <Eyebrow>Los rasgos a leer</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={VERDE} icon="fa-circle-dot" titulo="Raíces (ceros)">
              Donde la curva cruza el eje X (f(x) = 0). Una función puede tener varias, una o ninguna.
            </Parte>
            <Parte col={ORO} icon="fa-arrow-up-from-bracket" titulo="Intersección con Y">
              El punto (0, f(0)) donde la curva corta el eje vertical: el valor cuando x = 0.
            </Parte>
            <Parte col={MAGENTA} icon="fa-mountain" titulo="Máximos y mínimos">
              Cumbres y valles donde la función deja de crecer y empieza a decrecer (o al revés).
            </Parte>
            <Parte col={CIAN} icon="fa-arrows-left-right-to-line" titulo="Simetría (par / impar)">
              Par: espejo en el eje Y (f(−x) = f(x)). Impar: giro de 180° en el origen (f(−x) = −f(x)).
            </Parte>
          </div>

          <div className="fn-divider" />

          <Eyebrow>Crecer y decrecer</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Una función <strong style={{ color: T.text }}>crece</strong> donde la curva sube al avanzar en x y <strong>decrece</strong> donde baja. Entre un tramo creciente y uno decreciente hay un <strong style={{ color: MAGENTA }}>máximo</strong>; entre uno decreciente y uno creciente, un <strong style={{ color: CIAN }}>mínimo</strong>. Hallar esos extremos —optimizar— es uno de los grandes usos del cálculo.
          </div>

          <div className="fn-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Una <strong>parábola</strong> describe el clavado en Acapulco o el chorro de una fuente; una <strong>recta</strong>, un ritmo constante como la tarifa del taxi o el recibo de CFE; una función <strong>senoidal</strong>, ciclos que se repiten: la temperatura del día en la CDMX, las mareas del Golfo o la corriente alterna a 60 Hz de la red eléctrica. Reconocer la forma —y su simetría— ayuda a predecir el fenómeno.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="fn-bottom">
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
            Para el ejercicio de A2 elige <strong style={{ color: accent }}>f(x) = x³ − 3x</strong>: con «Analizar simetría» verás que el reflejo por el origen se encima (es <strong style={{ color: CIAN }}>impar</strong>), y con «Mostrar rasgos» aparecerán sus tres raíces (−√3, 0, √3) y sus extremos (−1, 2) y (1, −2).
          </span>
        </div>
      </div>
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

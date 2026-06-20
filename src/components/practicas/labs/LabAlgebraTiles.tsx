"use client";

/**
 * Laboratorio 3D — Álgebra con mosaicos (algebra tiles).
 * Pensamiento Matemático II («Introducción al álgebra»).
 *
 * UN mismo visor sirve a tres propósitos formativos; cada slug entra con su modo:
 *   • P01 «lenguaje»     — traduce una frase verbal a una expresión y la evalúa.
 *   • P02 «clasificacion» — cuenta términos: monomio / binomio / trinomio / polinomio.
 *   • P03 «operaciones»  — multiplica binomios con el modelo de área de mosaicos.
 *
 * Contenido VERBATIM del Modelo MCCEMS 2025 (anclas PM-II-P01/P02, A1 y A2).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { ALGEBRA_TILES_FICHA } from "./algebra-tiles-ficha";
import {
  VARIANTES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  OBJETIVOS,
  FRASES,
  EXPRESIONES,
  PRODUCTOS_PRESET,
  SEMEJANTES,
  CLASE_DESC,
  clasifica,
  evalTerminos,
  productoBinomios,
  RETO_POR_VARIANTE,
  type Variante,
} from "./algebra-tiles-data";

const AlgebraTilesScene = dynamic(() => import("./AlgebraTilesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-shapes fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AZUL = "#5fb0ff";
const VERDE = "#34D399";
const ORO = "#ffd24a";

// Pilar EQUIPARSE: la "mesa" del álgebra con mosaicos (3 correctos + 3 distractores).
const INSTRUMENTOS: EppItem[] = [
  { key: "mosaicos", nombre: "Mosaicos algebraicos", icono: "fa-shapes", ok: true, nota: "Piezas x², x y unidad que representan cada término." },
  { key: "tablero", nombre: "Tablero de trabajo", icono: "fa-table-cells", ok: true, nota: "Donde se acomodan y agrupan los mosaicos." },
  { key: "marcadores", nombre: "Marcadores de color", icono: "fa-palette", ok: true, nota: "Distinguen los términos positivos de los negativos." },
  { key: "probeta", nombre: "Probeta", icono: "fa-flask", ok: false, nota: "Mide volúmenes de líquido; aquí no se usa." },
  { key: "iman", nombre: "Imán", icono: "fa-magnet", ok: false, nota: "Mide campos magnéticos; no interviene en álgebra." },
  { key: "termo", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no aporta a operar expresiones." },
];

function LabAlgebraTilesBase({ color, varianteInicial }: PracticaLabProps & { varianteInicial: Variante }) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Variante>(varianteInicial);
  const [fraseIdx, setFraseIdx] = useState(0);
  const [xValue, setXValue] = useState(3);
  const [exprIdx, setExprIdx] = useState(0);
  const [ab, setAb] = useState<{ a: number; b: number }>({ a: 3, b: -2 });

  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioLenguaje, setVioLenguaje] = useState(varianteInicial === "lenguaje");
  const [vioClasificacion, setVioClasificacion] = useState(varianteInicial === "clasificacion");
  const [vioOperaciones, setVioOperaciones] = useState(varianteInicial === "operaciones");
  const [evaluo, setEvaluo] = useState(false);

  const [eppListo, setEppListo] = useState(false);
  const [aprobados, setAprobados] = useState<Record<Variante, boolean>>({ lenguaje: false, clasificacion: false, operaciones: false });
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

  const marcarVisto = useCallback((m: Variante) => {
    if (m === "lenguaje") setVioLenguaje(true);
    else if (m === "clasificacion") setVioClasificacion(true);
    else setVioOperaciones(true);
  }, []);

  const elegirModo = (m: Variante) => {
    setModo(m);
    marcarVisto(m);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => {
    setFraseIdx(0);
    setExprIdx(0);
    setAb({ a: 3, b: -2 });
    setXValue(3);
    setResetNonce((k) => k + 1);
  };

  const frase = FRASES[fraseIdx]!;
  const expr = EXPRESIONES[exprIdx]!;
  const prod = useMemo(() => productoBinomios(ab.a, ab.b), [ab]);
  const valorFrase = useMemo(() => evalTerminos(frase.terminos, xValue), [frase, xValue]);

  const modoActual = VARIANTES.find((v) => v.id === modo) ?? VARIANTES[0]!;
  const retoActual = RETO_POR_VARIANTE[modo];

  // props para la escena según el modo
  const sceneProps = useMemo(() => {
    if (modo === "lenguaje") return { terminos: frase.terminos, exprLabel: frase.expresion, claseLabel: undefined, a: 0, b: 0, expandLabel: "" };
    if (modo === "clasificacion") return { terminos: expr.terminos, exprLabel: expr.expresion, claseLabel: `${clasifica(expr.terminos.length)} · grado ${expr.grado}`, a: 0, b: 0, expandLabel: "" };
    return { terminos: [], exprLabel: prod.ecuacion, claseLabel: undefined, a: ab.a, b: ab.b, expandLabel: prod.expandido };
  }, [modo, frase, expr, prod, ab]);

  const objetivos = [
    { txt: "Equípate con la mesa de álgebra con mosaicos", done: eppListo },
    { txt: "Traduce una frase al lenguaje algebraico", done: vioLenguaje },
    { txt: "Clasifica una expresión (monomio…polinomio)", done: vioClasificacion },
    { txt: "Multiplica binomios con el modelo de área", done: vioOperaciones },
    { txt: "Evalúa una expresión para un valor de x", done: evaluo },
    { txt: "Resuelve el reto evaluable", done: aprobados.lenguaje || aprobados.clasificacion || aprobados.operaciones },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-shapes" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Álgebra con mosaicos</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: cada término del álgebra es una pieza geométrica. x² es un cuadrado de lado x, x es una tira y la unidad es un cuadrito. Con ellos se traduce el lenguaje, se clasifican expresiones y se multiplican binomios como áreas: (x + 3)(x − 2) = x² + x − 6.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes atlPulse { 0%,100%{ box-shadow:0 0 0 0 var(--atl); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .atl-live-dot { animation: atlPulse 1.6s ease-in-out infinite; }
        .atl-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .atl-grid { grid-template-columns: 1fr; } }
        .atl-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .atl-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .atl-icobtn:hover { background:rgba(255,255,255,0.12); }
        .atl-divider { height:1px; background:${T.line}; margin:18px 0; }
        .atl-modgrid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; }
        @media (max-width: 560px){ .atl-modgrid { grid-template-columns: 1fr; } }
        .atl-modbtn { cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; transition:all .15s; }
        .atl-modbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .atl-modbtn[data-on="true"] { border-color:var(--atl); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--atl); }
        .atl-cards { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
        @media (max-width: 560px){ .atl-cards { grid-template-columns: 1fr; } }
        .atl-card { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px;
          padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; transition:all .15s; }
        .atl-card:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .atl-card[data-on="true"] { border-color:var(--atl); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--atl); }
        .atl-steps { display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; }
        @media (max-width: 760px){ .atl-steps { grid-template-columns: 1fr 1fr; } }
        .atl-step { display:flex; gap:10px; align-items:flex-start; padding:11px 12px; border-radius:13px;
          border:1px solid ${T.line}; background:${T.inset}; transition:all .18s; }
        .atl-step[data-on="true"] { border-color:var(--atl); background:rgba(${color.rgba},0.12); box-shadow:0 4px 16px -8px var(--atl); }
        .atl-step-n { flex-shrink:0; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; color:${T.text3}; background:${T.glass}; border:1px solid ${T.line}; }
        .atl-step[data-on="true"] .atl-step-n { color:#04121f; background:var(--atl); border-color:var(--atl); }
        .atl-step-tx { font-size:11.5px; line-height:1.4; color:${T.text2}; }
        .atl-step[data-on="true"] .atl-step-tx { color:#fff; }
        .atl-step-tx strong { display:block; font-size:12px; color:${T.text}; margin-bottom:1px; }
        .atl-slider { width:100%; accent-color:${accent}; cursor:pointer; }

        .atl-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .atl-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .atl-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .atl-drawer[data-open="true"] { transform:translateX(0); }
        .atl-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .atl-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .atl-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .atl-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .atl-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .atl-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
        @media (max-width: 1000px){ .atl-bottom { grid-template-columns: 1fr !important; } }
        .atl-tilekey { display:inline-flex; align-items:center; gap:6px; font-size:11.5px; color:${T.text2}; }
        .atl-swatch { width:13px; height:13px; border-radius:4px; display:inline-block; }
      `}</style>

      {/* ── Pasos guiados ──────────────────────────────────────────── */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: 18 }}>
        <Eyebrow>
          <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: accent }} />
          Sigue los pasos del experimento
        </Eyebrow>
        <div className="atl-steps" style={{ ["--atl" as string]: accent }}>
          {[
            { n: 1, done: eppListo, t: "Equípate", d: "Elige la mesa de álgebra con mosaicos." },
            { n: 2, done: vioLenguaje, t: "Lenguaje", d: "Traduce una frase a una expresión." },
            { n: 3, done: vioClasificacion, t: "Clasifica", d: "Monomio, binomio, trinomio o polinomio." },
            { n: 4, done: vioOperaciones, t: "Opera", d: "Multiplica binomios con áreas." },
            { n: 5, done: aprobados.lenguaje || aprobados.clasificacion || aprobados.operaciones, t: "Resuelve", d: "Aprueba el reto evaluable." },
          ].map((s) => (
            <div key={s.n} className="atl-step" data-on={s.done}>
              <span className="atl-step-n">{s.done ? <i className="fa-solid fa-check" /> : s.n}</span>
              <span className="atl-step-tx">
                <strong>{s.t}</strong>
                {s.d}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="atl-grid">
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
              <AlgebraTilesScene
                modo={modo}
                terminos={sceneProps.terminos}
                exprLabel={sceneProps.exprLabel}
                claseLabel={sceneProps.claseLabel}
                a={sceneProps.a}
                b={sceneProps.b}
                expandLabel={sceneProps.expandLabel}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Prepara tu mesa de álgebra con mosaicos"
                subtitulo="Antes de operar con expresiones, equípate con lo correcto"
                intro={`Para representar cada término como una pieza geométrica y agruparlos necesitas el material adecuado. Selecciona solo las ${INSTRUMENTOS.filter((i) => i.ok).length} piezas que sirven (deja fuera lo que mide otra cosa).`}
                verbo="modelado algebraico"
                onEntrar={() => {
                  setEppListo(true);
                  if (sonido) audioRef.current?.blip();
                }}
              />
            )}

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="atl-live-dot" style={{ ["--atl" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className={`fa-solid ${modoActual.icon}`} style={{ marginRight: 8 }} />
                {modoActual.nombre}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="atl-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="atl-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="atl-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="atl-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="atl-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Leyenda de mosaicos */}
            <div style={{ position: "absolute", bottom: 14, left: 16, display: "flex", gap: 14, padding: "8px 13px", borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <span className="atl-tilekey"><span className="atl-swatch" style={{ background: AZUL }} /> x²</span>
              <span className="atl-tilekey"><span className="atl-swatch" style={{ background: VERDE }} /> x</span>
              <span className="atl-tilekey"><span className="atl-swatch" style={{ background: ORO }} /> 1</span>
              <span className="atl-tilekey"><span className="atl-swatch" style={{ background: "#f0667d" }} /> negativo</span>
            </div>

            <button className="atl-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles: modo + panel del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              ¿Qué quieres explorar?
            </Eyebrow>
            <div className="atl-modgrid">
              {VARIANTES.map((v) => (
                <button
                  key={v.id}
                  className="atl-modbtn"
                  data-on={modo === v.id}
                  onClick={() => elegirModo(v.id)}
                  style={{ ["--atl" as string]: accent }}
                >
                  <i className={`fa-solid ${v.icon}`} style={{ fontSize: 17, color: modo === v.id ? accent : T.text3 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: modo === v.id ? accent : T.text }}>{v.nombre}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 10 }}>{modoActual.desc}</div>

            {/* Panel del modo LENGUAJE */}
            {modo === "lenguaje" && (
              <div style={{ marginTop: 16, ["--atl" as string]: accent }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text3, letterSpacing: "0.04em" }}>ELIGE UNA FRASE</span>
                <div className="atl-cards" style={{ marginTop: 8 }}>
                  {FRASES.map((f, i) => (
                    <button key={f.id} className="atl-card" data-on={fraseIdx === i} onClick={() => { setFraseIdx(i); if (sonido) audioRef.current?.blip(); }}>
                      <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.35 }}>{f.frase}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{f.expresion}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 14, marginBottom: 7 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text3, letterSpacing: "0.04em" }}>EVALÚA PARA x =</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: VERDE, fontFamily: "ui-monospace, monospace" }}>
                    x = {xValue} → {Number.isInteger(valorFrase) ? valorFrase : valorFrase.toFixed(2)}
                  </span>
                </div>
                <input className="atl-slider" type="range" min={-5} max={10} step={1} value={xValue} onChange={(e) => { setXValue(Number(e.target.value)); setEvaluo(true); }} />
              </div>
            )}

            {/* Panel del modo CLASIFICACION */}
            {modo === "clasificacion" && (
              <div style={{ marginTop: 16, ["--atl" as string]: accent }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text3, letterSpacing: "0.04em" }}>ELIGE UNA EXPRESIÓN</span>
                <div className="atl-cards" style={{ marginTop: 8 }}>
                  {EXPRESIONES.map((ex, i) => {
                    const c = clasifica(ex.terminos.length);
                    return (
                      <button key={ex.id} className="atl-card" data-on={exprIdx === i} onClick={() => { setExprIdx(i); if (sonido) audioRef.current?.blip(); }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{ex.expresion}</span>
                        <span style={{ fontSize: 11, color: T.text3 }}>{c} · {ex.terminos.length} {ex.terminos.length === 1 ? "término" : "términos"} · grado {ex.grado}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Panel del modo OPERACIONES */}
            {modo === "operaciones" && (
              <div style={{ marginTop: 16, ["--atl" as string]: accent }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text3, letterSpacing: "0.04em" }}>MULTIPLICA DOS BINOMIOS</span>
                <div className="atl-cards" style={{ marginTop: 8 }}>
                  {PRODUCTOS_PRESET.map((p) => (
                    <button key={p.etiqueta} className="atl-card" data-on={ab.a === p.a && ab.b === p.b} onClick={() => { setAb({ a: p.a, b: p.b }); if (sonido) audioRef.current?.blip(); }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{p.etiqueta}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text3 }}>a (en x + a)</span>
                      <span style={{ fontSize: 12.5, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{ab.a >= 0 ? `+${ab.a}` : ab.a}</span>
                    </div>
                    <input className="atl-slider" type="range" min={-4} max={4} step={1} value={ab.a} onChange={(e) => setAb((s) => ({ ...s, a: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text3 }}>b (en x + b)</span>
                      <span style={{ fontSize: 12.5, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{ab.b >= 0 ? `+${ab.b}` : ab.b}</span>
                    </div>
                    <input className="atl-slider" type="range" min={-4} max={4} step={1} value={ab.b} onChange={(e) => setAb((s) => ({ ...s, b: Number(e.target.value) }))} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lectura del modelo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              {modo === "lenguaje" ? "Del lenguaje al símbolo" : modo === "clasificacion" ? "Anatomía de la expresión" : "El producto como área"}
            </Eyebrow>
            {modo === "lenguaje" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Expresión" value={frase.expresion} col={accent} size={15} />
                  <Readout label={`Valor en x = ${xValue}`} value={`${Number.isInteger(valorFrase) ? valorFrase : valorFrase.toFixed(2)}`} col={VERDE} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{frase.explica}</div>
              </>
            ) : modo === "clasificacion" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Clase" value={clasifica(expr.terminos.length)} col={accent} size={15} />
                  <Readout label="Términos" value={`${expr.terminos.length}`} col={AZUL} size={15} />
                  <Readout label="Grado" value={`${expr.grado}`} col={VERDE} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                  {CLASE_DESC[clasifica(expr.terminos.length)]} En el primer término el <strong style={{ color: ORO }}>coeficiente</strong> es {expr.anatomia.coeficiente}, la <strong style={{ color: VERDE }}>variable</strong> es {expr.anatomia.variable} y el <strong style={{ color: AZUL }}>exponente</strong> es {expr.anatomia.exponente}.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Producto" value={prod.ecuacion} col={accent} size={14} />
                  <Readout label="Coef. de x" value={`${prod.coefX >= 0 ? "+" : ""}${prod.coefX}`} col={VERDE} size={15} />
                  <Readout label="Constante" value={`${prod.constante >= 0 ? "+" : ""}${prod.constante}`} col={ORO} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                  Área total = <strong style={{ color: accent }}>{prod.expandido}</strong>. El cuadrado azul es x²; las tiras verdes suman (a + b)x = {prod.coefX}x; los cuadritos dorados son a·b = {prod.constante}.
                </div>
                <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}`, fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: T.text }}>Términos semejantes: </strong>{SEMEJANTES.entrada} = <strong style={{ color: accent }}>{SEMEJANTES.resultado}</strong>. {SEMEJANTES.pasos}: solo se suman los que tienen la misma variable y exponente.
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Qué es el lenguaje algebraico</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            El <strong style={{ color: T.text }}>álgebra</strong> usa letras para representar cantidades que no conocemos o que cambian. Cada término es una pieza: <strong style={{ color: AZUL }}>x²</strong> un cuadrado de lado x, <strong style={{ color: VERDE }}>x</strong> una tira y <strong style={{ color: ORO }}>1</strong> un cuadrito. Verlos como mosaicos hace tangible el lenguaje, su clasificación y sus operaciones.
          </div>

          <div className="atl-divider" />

          <Eyebrow>Las cuatro clases</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={ORO} icon="fa-1" titulo="Monomio — 1 término">7x³, 5x², −4. Un solo bloque de mosaicos.</Parte>
            <Parte col={VERDE} icon="fa-2" titulo="Binomio — 2 términos">3x + 7, x² − 9. Dos grupos.</Parte>
            <Parte col={AZUL} icon="fa-3" titulo="Trinomio — 3 términos">x² + 4x − 2. Tres grupos.</Parte>
            <Parte col="#f0a6ff" icon="fa-list-ol" titulo="Polinomio — 4 o más">2x³ + x² − 5x + 1. Muchos grupos.</Parte>
          </div>

          <div className="atl-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Un arquitecto del <strong>INFONAVIT</strong> escribe el área de un lote como <strong style={{ color: ORO }}>x·(2x + 5) = 2x² + 5x</strong> para ajustar la vivienda; una hoja de cálculo evalúa fórmulas algebraicas; los patrones de costo de n productos se generalizan con expresiones.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="atl-bottom">
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
            Para multiplicar binomios: <strong style={{ color: VERDE }}>(x + a)(x + b) = x² + (a + b)x + a·b</strong>. Los signos importan: en (x + 3)(x − 2), a + b = 1 y a·b = −6, así que el resultado es <strong style={{ color: accent }}>x² + x − 6</strong>.
          </span>
        </div>
      </div>

      {/* ── Ideas + glosario ────────────────────────────────────────── */}
      <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
          Ideas clave
        </Eyebrow>
        <ul style={{ margin: "4px 0 4px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          {IDEAS.map((idea, i) => (
            <li key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{idea}</li>
          ))}
        </ul>

        <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 11, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
          <strong style={{ color: accent }}>Contexto. </strong>{CONTEXTO}
        </div>

        <div className="atl-divider" />

        <Eyebrow>Glosario</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {GLOSARIO.map((g) => (
            <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 3 }}>{g.termino}</div>
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</div>
              <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} />{g.ejemplo}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          <i className="fa-solid fa-book" style={{ marginRight: 6 }} />{FUENTE}
        </div>
      </div>

      {/* ── Reto evaluable (según el modo) ───────────────────────────── */}
      <RetoNumericoCard
        key={modo}
        reto={retoActual}
        accent={accent}
        aprobado={aprobados[modo]}
        onAprobado={() => setAprobados((s) => ({ ...s, [modo]: true }))}
        playSfx={() => {
          if (sonido) audioRef.current?.correcto();
        }}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="atl-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="atl-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="atl-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="atl-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="atl-drawer-body">
          <FichaTeorica data={ALGEBRA_TILES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      {/* objetivos verbatim (referencia para lectura) */}
      <div style={{ display: "none" }} aria-hidden>{OBJETIVOS.join(" · ")}</div>
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

/* ── Wrappers por slug (un mismo motor, modo inicial distinto) ─────────── */
export function LabLenguajeAlgebraico(props: PracticaLabProps) {
  return <LabAlgebraTilesBase {...props} varianteInicial="lenguaje" />;
}
export function LabClasificacionExpresiones(props: PracticaLabProps) {
  return <LabAlgebraTilesBase {...props} varianteInicial="clasificacion" />;
}
export function LabOperacionesMonomiosBinomios(props: PracticaLabProps) {
  return <LabAlgebraTilesBase {...props} varianteInicial="operaciones" />;
}

export default LabLenguajeAlgebraico;

"use client";

/**
 * Laboratorio 3D — Análisis completo de una función: máximos, mínimos e inflexión.
 * Práctica experimental para PM-V-P06-A2 (ejercicio_matematico "Análisis completo
 * de función: encontrando extremos e inflexión"; progresión 6, UAC PM-V Cálculo
 * Diferencial).
 *
 * El alumno explora una sola función, f(x) = x³ − 3x² − 9x + 5, viendo a la vez
 * la curva f, su derivada f' (ámbar) y su segunda derivada f'' (violeta). Una
 * sonda x = a (deslizable, animada o saltando a un punto notable) muestra que:
 *  · donde f' = 0 hay un punto crítico (la tangente es horizontal),
 *  · el signo de f'' clasifica ese crítico (f'' < 0 → máximo, f'' > 0 → mínimo),
 *  · donde f'' cambia de signo hay un punto de inflexión.
 * Resultados verbatim del A2: máximo (−1, 10), inflexión (1, −6), mínimo (3, −22);
 * crece en x < −1 ó x > 3; cóncava arriba en x > 1.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { ANALISIS_FICHA } from "./extremos-inflexion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./extremos-inflexion-data";
import { LabSfx } from "./lab-audio";
import {
  VISTA, PUNTOS, punto, evalF, evalD1, evalD2, clasificar, tangente, rectaStr,
  INTERVALOS, PASOS, IDEAS, DATOS, F_EXPR, D1_EXPR, D2_EXPR, fmt2, fmt3,
  type FocoId,
} from "./analisis-data";

const AnalisisScene = dynamic(() => import("./AnalisisScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Analizando la función…</span>
    </div>
  ),
});

const F_COL = "#2DD4BF";    // curva f
const D1_COL = "#fbbf24";   // curva f'
const D2_COL = "#C084FC";   // curva f''
const TAN_COL = "#34D399";  // tangente a f
const A_COL = "#7dd3fc";    // sonda x = a

export function LabAnalisis({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [aPos, setAPos] = useState<number>(-1); // arranca en el máximo
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(true);
  const [playing, setPlaying] = useState(false);
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

  // Animación: la sonda x = a barre el dominio de ida y vuelta.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const span = VISTA.xmax - VISTA.xmin;
      setAPos((prev) => {
        let next = prev + dir * dt * span * 0.26;
        if (next <= VISTA.xmin) { next = VISTA.xmin; dir = 1; }
        else if (next >= VISTA.xmax) { next = VISTA.xmax; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const irA = (id: FocoId) => {
    setPlaying(false);
    if (id !== "libre") setAPos(punto(id).x);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setAPos(-1);
    setShow1(true);
    setShow2(true);
    bump();
  };

  // valores en vivo
  const fa = evalF(aPos);
  const d1 = evalD1(aPos);
  const d2 = evalD2(aPos);
  const { m: mt, b: bt } = tangente(aPos);
  const cl = clasificar(aPos);

  // ¿en qué foco está la sonda? (para resaltar el botón)
  const focoActivo: FocoId = cl.cerca ? cl.cerca.id : "libre";

  let lecturaCrec = "f'(a) ≈ 0: pendiente casi horizontal (cerca de un punto crítico).";
  if (cl.creciente) lecturaCrec = `f'(${fmt2(aPos)}) = ${fmt2(d1)} > 0 → f está CRECIENDO aquí.`;
  else if (cl.decreciente) lecturaCrec = `f'(${fmt2(aPos)}) = ${fmt2(d1)} < 0 → f está DECRECIENDO aquí.`;

  let lecturaConc = "f''(a) ≈ 0: cerca de un cambio de concavidad (inflexión).";
  if (cl.concavaArriba) lecturaConc = `f''(${fmt2(aPos)}) = ${fmt2(d2)} > 0 → cóncava hacia ARRIBA (∪).`;
  else if (cl.concavaAbajo) lecturaConc = `f''(${fmt2(aPos)}) = ${fmt2(d2)} < 0 → cóncava hacia ABAJO (∩).`;

  const objetivos = [
    { txt: "Salta al máximo local (x = −1) y lee f'(a) ≈ 0", done: focoActivo === "max" },
    { txt: "Salta al mínimo local (x = 3) y confirma f''(a) > 0", done: focoActivo === "min" },
    { txt: "Salta al punto de inflexión (x = 1) y verifica cambio de concavidad", done: focoActivo === "infl" },
    { txt: "Barre la sonda con Play para ver las tres curvas en movimiento", done: playing },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{F_EXPR}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: f&apos; = 0 da los críticos x = −1 y x = 3; f&apos;&apos; los clasifica (máximo en −1, mínimo en 3) y f&apos;&apos; = 0 marca la inflexión en x = 1.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseAn { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseAn 1.6s ease-in-out infinite; }
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
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:7px; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-toggle { cursor:pointer; padding:7px 11px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text3}; font-size:12px; font-weight:800; transition:all .15s; display:flex; align-items:center; gap:7px; }
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
              <AnalisisScene aPos={aPos} show1={show1} show2={show2} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{F_EXPR}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Barrer la sonda (x = a)"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
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

            {/* Leyenda curvas */}
            <div style={{ position: "absolute", top: 60, left: 16, display: "flex", flexDirection: "column", gap: 6, padding: "9px 12px", borderRadius: 12, background: "rgba(4,10,22,0.7)", border: `1px solid ${T.line}`, backdropFilter: "blur(8px)" }}>
              <LegItem col={F_COL} txt="f(x)" />
              {show1 && <LegItem col={D1_COL} txt="f'(x)" dashed />}
              {show2 && <LegItem col={D2_COL} txt="f''(x)" dashed />}
              <LegItem col={TAN_COL} txt="tangente en a" />
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                {cl.cerca ? (
                  <>
                    <i className={`fa-solid ${cl.cerca.icono}`} style={{ color: cl.cerca.color, marginRight: 7 }} />
                    {cl.cerca.tipo} en x = {fmt2(cl.cerca.x)} — {cl.cerca.criterio}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-ruler-combined" style={{ color: TAN_COL, marginRight: 7 }} />
                    {lecturaCrec}
                  </>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{lecturaConc}</div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-crosshairs" style={{ marginRight: 8, color: accent }} />
              Salta a un punto notable o mueve la sonda x = a
            </Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {PUNTOS.map((p) => (
                <button key={p.id} className="ex-chip" data-on={focoActivo === p.id} onClick={() => irA(p.id)} title={p.detalle}>
                  <i className={`fa-solid ${p.icono}`} style={{ color: p.color }} />
                  {p.tipo} (x = {fmt2(p.x)})
                </button>
              ))}
              <button className="ex-chip" data-on={focoActivo === "libre"} onClick={() => irA("libre")} title="Exploración libre">
                <i className="fa-solid fa-hand-pointer" style={{ color: A_COL }} />
                Libre
              </button>
            </div>
            <Deslizador
              label="sonda  x = a"
              icon="fa-crosshairs"
              colr={A_COL}
              valor={fmt2(aPos)}
              min={VISTA.xmin} max={VISTA.xmax} step={0.02} value={aPos}
              onChange={(v) => { setPlaying(false); setAPos(v); }}
              hintL={fmt2(VISTA.xmin)} hintR={fmt2(VISTA.xmax)}
            />
            <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
              <button className="ex-toggle" style={show1 ? { borderColor: `${D1_COL}88`, background: `${D1_COL}1e`, color: "#fff" } : undefined} onClick={() => setShow1((s) => !s)}>
                <i className={`fa-solid ${show1 ? "fa-eye" : "fa-eye-slash"}`} style={{ color: D1_COL }} />
                f&apos;(x)
              </button>
              <button className="ex-toggle" style={show2 ? { borderColor: `${D2_COL}88`, background: `${D2_COL}1e`, color: "#fff" } : undefined} onClick={() => setShow2((s) => !s)}>
                <i className={`fa-solid ${show2 ? "fa-eye" : "fa-eye-slash"}`} style={{ color: D2_COL }} />
                f&apos;&apos;(x)
              </button>
            </div>
          </div>

          {/* Cómo se leen f, f' y f'' juntas */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
              Las tres alturas en x = {fmt2(aPos)}
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <MiniVal label={`f(${fmt2(aPos)})`} value={fmt2(fa)} col={F_COL} />
              <MiniVal label={`f'(${fmt2(aPos)}) (pendiente)`} value={fmt2(d1)} col={D1_COL} />
              <MiniVal label={`f''(${fmt2(aPos)}) (concavidad)`} value={fmt2(d2)} col={D2_COL} />
            </div>
            <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 12, border: `1px solid ${TAN_COL}55`, background: `${TAN_COL}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
              <i className="fa-solid fa-ruler-combined" style={{ color: TAN_COL, marginRight: 8 }} />
              La tangente a f en x = {fmt2(aPos)} es <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>{rectaStr(mt, bt)}</strong>; su pendiente es <strong style={{ color: D1_COL }}>f&apos;({fmt2(aPos)}) = {fmt3(d1)}</strong>.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* La función y sus derivadas */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${F_COL}66`, background: `${F_COL}12` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: F_COL }}>
                <i className="fa-solid fa-chart-line" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>La función y sus derivadas</div>
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              <ExprRow col={F_COL} txt={F_EXPR} />
              <ExprRow col={D1_COL} txt={D1_EXPR} />
              <ExprRow col={D2_COL} txt={D2_EXPR} />
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {PUNTOS.map((p) => (
                <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${p.color}44` }}>
                  <i className={`fa-solid ${p.icono}`} style={{ color: p.color, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{p.tipo} ({fmt2(p.x)}, {fmt2(p.y)})</div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>{p.criterio}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolución paso a paso (verbatim A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Análisis completo — paso a paso
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

          {/* Intervalos (verbatim A2 (d)) */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-arrows-left-right-to-line" style={{ marginRight: 8, color: accent }} />
              Intervalos de la función
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <Intervalo col="#34D399" icono="fa-arrow-trend-up" titulo="Creciente (f' > 0)" texto={INTERVALOS.crece} />
              <Intervalo col="#F87171" icono="fa-arrow-trend-down" titulo="Decreciente (f' < 0)" texto={INTERVALOS.decrece} />
              <Intervalo col="#C084FC" icono="fa-arrow-down-wide-short" titulo="Cóncava abajo (f'' < 0, ∩)" texto={INTERVALOS.concavaAbajo} />
              <Intervalo col="#7dd3fc" icono="fa-arrow-up-wide-short" titulo="Cóncava arriba (f'' > 0, ∪)" texto={INTERVALOS.concavaArriba} />
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
            <Readout label="sonda a" value={fmt2(aPos)} col={A_COL} size={15} />
            <Readout label="f(a)" value={fmt2(fa)} col={F_COL} size={15} />
            <Readout label="f'(a)" value={fmt2(d1)} col={D1_COL} size={15} />
            <Readout label="f''(a)" value={fmt2(d2)} col={D2_COL} size={15} />
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
          Cálculo <strong>exacto</strong>: la función <strong>f(x) = x³ − 3x² − 9x + 5</strong> y sus derivadas son verbatim del enunciado A2, y todos los valores (críticos x = −1 y x = 3, inflexión x = 1, máximo (−1, 10), mínimo (3, −22), inflexión (1, −6) e intervalos) son <strong>simbólicos cerrados</strong> resueltos a mano. La curva de f&apos; localiza los críticos donde toca el eje y la de f&apos;&apos; da la concavidad; el plano usa una escala vertical comprimida para que las tres curvas quepan, así que en los bordes f&apos; y f&apos;&apos; salen del recuadro visible.
        </span>
      </div>

      {/* ── Objetivos ──────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500, ...NUM }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ─────────── */}
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
          <FichaTeorica data={ANALISIS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
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

/* ── Fila de intervalo ────────────────────────────────────────────────────── */
function Intervalo({ col, icono, titulo, texto }: { col: string; icono: string; titulo: string; texto: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: T.glass, border: `1px solid ${col}33` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icono}`} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{titulo}</div>
        <div style={{ fontSize: 12.5, color: col, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{texto}</div>
      </div>
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

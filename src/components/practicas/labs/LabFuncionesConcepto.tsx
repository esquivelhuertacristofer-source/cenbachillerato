"use client";

/**
 * Laboratorio 3D — Concepto de función y sus representaciones.
 * Práctica experimental para PM-IV-P01-A2 (ejercicio_matematico "Identifico y
 * evalúo una función a partir de una tabla de valores"; progresión 1).
 *
 * Dos modos sobre un plano cartesiano flotante:
 *  · MÁQUINA: el alumno mueve la entrada x y ve la salida f(x) — a cada entrada,
 *    EXACTAMENTE UNA salida (definición de función). Las 4 representaciones
 *    (tabular, gráfica, algebraica, verbal) se sincronizan en vivo.
 *  · TEST: prueba de la línea vertical — distingue funciones (parábola, recta…)
 *    de no-funciones (circunferencia, parábola acostada).
 * Valores verbatim del enunciado del café (A2) y de los ejemplos de la lectura (A1).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { FUNCIONES_FICHA } from "./funciones-concepto-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import {
  RELACIONES, FUNCIONES, rel, evalRel, ramas, tablaDe, enDominio,
  IDEAS, DATOS, RETO, RETO_A2, fmt1, conUnidad, sustitucion,
  MODO_DEF, REL_DEF, type RelId, type Modo,
} from "./funciones-concepto-data";
import { LabSfx } from "./lab-audio";

const FuncionesConceptoScene = dynamic(() => import("./FuncionesConceptoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-diagram-project fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const IN_COL = "#fbbf24";   // entrada (x)
const OUT_COL = "#34D399";  // salida (f(x))
const OK_COL = "#34D399";   // pasa la prueba
const BAD_COL = "#f87171";  // no pasa la prueba

export function LabFuncionesConcepto({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>(MODO_DEF);
  const [relId, setRelId] = useState<RelId>(REL_DEF);
  const [xPos, setXPos] = useState<number>(rel(REL_DEF).xDef);
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

  const r = useMemo(() => rel(relId), [relId]);

  // Barrido automático de la entrada x (rebota en los extremos del dominio).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const span = r.domMax - r.domMin || 1;
    const speed = span / 6; // recorre el dominio en ~6 s
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      setXPos((prev) => {
        let next = prev + dt * speed * dir;
        if (next >= r.domMax) { next = r.domMax; dir = -1; }
        else if (next <= r.domMin) { next = r.domMin; dir = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, r.domMin, r.domMax]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirRel = (id: RelId) => {
    setPlaying(false); setRelId(id); setXPos(rel(id).xDef); bump();
    if (sonido) audioRef.current?.blip();
  };
  const elegirModo = (m: Modo) => {
    setPlaying(false);
    setModo(m);
    // en máquina solo tienen sentido las funciones: si la relación actual no lo es, cambia a una función
    if (m === "maquina" && !rel(relId).esFuncion) { setRelId(REL_DEF); setXPos(rel(REL_DEF).xDef); }
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const setXman = (v: number) => { setPlaying(false); setXPos(v); };
  const reset = () => { setPlaying(false); setModo(MODO_DEF); setRelId(REL_DEF); setXPos(rel(REL_DEF).xDef); bump(); };

  const dentro = enDominio(relId, xPos);
  const yVal = evalRel(relId, xPos);
  const yTxt = r.esFuncion && Number.isFinite(yVal) ? conUnidad(yVal, r.unidadY, 1) : "—";
  const cortes = ramas(relId, xPos).length;

  const tabla = useMemo(() => tablaDe(relId), [relId]);
  // fila resaltada: la más cercana a xPos
  const filaActiva = useMemo(() => {
    if (!tabla.rows.length) return -1;
    let best = 0;
    let bestD = Infinity;
    tabla.rows.forEach((row, i) => {
      const d = Math.abs(row.x - xPos);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }, [tabla, xPos]);

  const relsVisibles = modo === "maquina" ? FUNCIONES : RELACIONES;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-diagram-project" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{r.titulo}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {r.algebraica}. {r.verbal}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseFn { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseFn 1.6s ease-in-out infinite; }
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
              <FuncionesConceptoScene relId={relId} modo={modo} xPos={xPos} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{r.algebraica}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar el barrido" : modo === "maquina" ? "Recorrer las entradas" : "Barrer la línea vertical"}>
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

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "maquina" ? (
                <>
                  <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                    <i className="fa-solid fa-right-to-bracket" style={{ color: IN_COL, marginRight: 7 }} />
                    entra <strong style={{ color: IN_COL }}>x = {conUnidad(xPos, r.unidadX, 1)}</strong>
                    &nbsp;&nbsp;→&nbsp;&nbsp;
                    <i className="fa-solid fa-right-from-bracket" style={{ color: OUT_COL, marginRight: 7 }} />
                    sale <strong style={{ color: OUT_COL }}>f(x) = {yTxt}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, fontFamily: "ui-monospace, monospace" }}>
                    {dentro ? sustitucion(relId, xPos) : "x fuera del dominio"}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                    <i className="fa-solid fa-grip-lines-vertical" style={{ color: r.esFuncion ? OK_COL : BAD_COL, marginRight: 7 }} />
                    la línea vertical corta en <strong style={{ color: cortes > 1 ? BAD_COL : OK_COL }}>{cortes} {cortes === 1 ? "punto" : "puntos"}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                    {r.esFuncion
                      ? "Ninguna vertical la corta dos veces → SÍ es función."
                      : "Existe una vertical que la corta dos veces → NO es función."}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              {modo === "maquina" ? "Mueve la entrada y observa la salida" : "Barre la línea vertical y juzga"}
            </Eyebrow>

            {/* selector de modo */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button className="ex-seg" data-on={modo === "maquina"} onClick={() => elegirModo("maquina")}>
                <i className="fa-solid fa-gears" /> Máquina (evaluar)
              </button>
              <button className="ex-seg" data-on={modo === "test"} onClick={() => elegirModo("test")}>
                <i className="fa-solid fa-grip-lines-vertical" /> ¿Es función?
              </button>
            </div>

            {/* deslizador de entrada / barrido */}
            <Deslizador
              label={modo === "maquina" ? `entrada x (${r.unidadX || "x"})` : "posición de la línea vertical"}
              icon={modo === "maquina" ? "fa-right-to-bracket" : "fa-grip-lines-vertical"}
              colr={modo === "maquina" ? IN_COL : (r.esFuncion ? OK_COL : BAD_COL)}
              valor={conUnidad(xPos, r.unidadX, 1)}
              min={r.domMin} max={r.domMax} step={r.xStep} value={xPos}
              onChange={setXman}
              hintL={fmt1(r.domMin)} hintR={fmt1(r.domMax)}
            />

            {/* relaciones disponibles */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>
              {modo === "maquina" ? "FUNCIONES (elige una)" : "RELACIONES (¿cuáles son función?)"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {relsVisibles.map((rr) => (
                <button key={rr.id} className="ex-chip" data-on={relId === rr.id} onClick={() => elegirRel(rr.id)} title={rr.titulo}>
                  <i className={`fa-solid ${rr.icono}`} style={{ color: rr.color }} />
                  {rr.label}
                  {!rr.esFuncion && <span style={{ fontSize: 9.5, fontWeight: 900, color: BAD_COL, border: `1px solid ${BAD_COL}66`, borderRadius: 5, padding: "1px 4px", marginLeft: 2 }}>no fn</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Las 4 representaciones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
              Las 4 representaciones de la misma función
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
              {/* Tabular */}
              <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(4,10,22,0.4)" }}>
                <RepHead icono="fa-table-cells" nombre="Tabular" accent={accent} />
                {tabla.rows.length ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "ui-monospace, monospace", fontSize: 11.5 }}>
                    <tbody>
                      <tr>
                        <td style={{ color: T.text3, padding: "2px 4px", fontWeight: 800 }}>{r.unidadX || "x"}</td>
                        {tabla.rows.map((row, i) => (
                          <td key={i} style={{ textAlign: "center", padding: "2px 4px", color: i === filaActiva && modo === "maquina" ? IN_COL : T.text2, fontWeight: i === filaActiva && modo === "maquina" ? 900 : 600 }}>{fmt1(row.x)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ color: T.text3, padding: "2px 4px", fontWeight: 800 }}>{r.unidadY || "y"}</td>
                        {tabla.rows.map((row, i) => (
                          <td key={i} style={{ textAlign: "center", padding: "2px 4px", color: i === filaActiva && modo === "maquina" ? OUT_COL : T.text2, fontWeight: i === filaActiva && modo === "maquina" ? 900 : 600 }}>{fmt1(row.y)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontSize: 11.5, color: T.text3 }}>Relación sin tabla (no es función).</div>
                )}
                <div style={{ fontSize: 10, color: T.text3, marginTop: 6 }}>
                  {tabla.verbatim ? "valores del enunciado (A2)" : "valores calculados con la fórmula"}
                </div>
              </div>

              {/* Gráfica */}
              <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(4,10,22,0.4)" }}>
                <RepHead icono="fa-chart-line" nombre="Gráfica" accent={accent} />
                <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  Es la escena 3D de arriba ↑. Revela tendencias, máximos y mínimos de un vistazo.
                  {modo === "maquina" && r.esFuncion && Number.isFinite(yVal) && (
                    <> Ahora marca el punto <strong style={{ color: OUT_COL }}>({fmt1(xPos)}, {fmt1(yVal)})</strong>.</>
                  )}
                </div>
              </div>

              {/* Algebraica */}
              <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(4,10,22,0.4)" }}>
                <RepHead icono="fa-square-root-variable" nombre="Algebraica" accent={accent} />
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{r.algebraica}</div>
                {modo === "maquina" && r.esFuncion && dentro && (
                  <div style={{ fontSize: 11.5, color: OUT_COL, fontFamily: "ui-monospace, monospace", marginTop: 5 }}>{sustitucion(relId, xPos)}</div>
                )}
              </div>

              {/* Verbal */}
              <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(4,10,22,0.4)" }}>
                <RepHead icono="fa-comment" nombre="Verbal" accent={accent} />
                <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{r.verbal}</div>
              </div>
            </div>
            {r.nota && (
              <div style={{ marginTop: 12, fontSize: 11, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
                <span>{r.nota}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Veredicto / definición */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${(r.esFuncion ? OK_COL : BAD_COL)}66`, background: `${(r.esFuncion ? OK_COL : BAD_COL)}12` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: r.esFuncion ? OK_COL : BAD_COL }}>
                <i className={`fa-solid ${r.esFuncion ? "fa-check" : "fa-xmark"}`} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{r.titulo}</div>
                <div style={{ fontSize: 11.5, color: r.esFuncion ? OK_COL : BAD_COL, fontWeight: 800 }}>{r.esFuncion ? "SÍ es función" : "NO es función"}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{r.dominioTxt}</div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5, marginTop: 8 }}>{r.contexto}</div>
          </div>

          {/* Definición + prueba de la línea vertical */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              ¿Qué es una función?
            </Eyebrow>
            <div style={{ fontSize: 12.2, color: T.text2, lineHeight: 1.55 }}>
              Una función es una regla que a <strong style={{ color: IN_COL }}>cada elemento del dominio</strong> (las entradas x) le asigna <strong style={{ color: OUT_COL }}>exactamente un elemento del rango</strong> (una salida y).
            </div>
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(4,10,22,0.4)" }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
                <i className="fa-solid fa-grip-lines-vertical" style={{ marginRight: 7, color: accent }} />
                Prueba de la línea vertical
              </div>
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
                Si una recta vertical corta la gráfica en <strong style={{ color: BAD_COL }}>más de un punto</strong>, NO es función. Una circunferencia completa no la pasa; una parábola (vertical) sí.
              </div>
            </div>
          </div>

          {/* Reto guiado: el café (A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-mug-hot" style={{ marginRight: 8, color: accent }} />
              Reto resuelto: el café que se enfría
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{RETO.enunciado}</div>
            <div style={{ display: "grid", gap: 9 }}>
              {RETO.pasos.map((p) => (
                <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.35 }}>{p.pregunta}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginTop: 2, lineHeight: 1.4 }}>{p.respuesta}</div>
                  </div>
                </div>
              ))}
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
            <Readout label="es función" value={r.esFuncion ? "sí" : "no"} col={r.esFuncion ? OK_COL : BAD_COL} size={18} />
            <Readout label={modo === "maquina" ? "entrada x" : "línea en x"} value={conUnidad(xPos, r.unidadX, 1)} col={IN_COL} size={15} />
            <Readout label="salida f(x)" value={yTxt} col={OUT_COL} size={15} />
            <Readout label="cortes vertical" value={`${cortes}`} col={cortes > 1 ? BAD_COL : OK_COL} size={18} />
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
          Cálculo <strong>exacto</strong>: cada salida f(x) se evalúa con la fórmula real (la tabla del café son los valores <strong>verbatim</strong> del enunciado A2). El plano se dibuja a <strong>escala propia</strong> por relación para mostrar valores reales (min/°C, s/m, $…); los modelos del Pico de Orizaba y del Metro se etiquetan como <strong>aproximados/típicos</strong> donde corresponde.
        </span>
      </div>

      {/* ── Objetivos ────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Mueve la entrada x y observa la única salida f(x)", done: true },
            { txt: "Aplica la prueba de la línea vertical en modo ¿Es función?", done: true },
            { txt: "Distingue una relación que sí es función de una que no lo es", done: true },
            { txt: "Explora las 4 representaciones (tabular, gráfica, algebraica, verbal)", done: true },
            { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────────── */}
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
          <FichaTeorica data={FUNCIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Encabezado de una representación ─────────────────────────────────────── */
function RepHead({ icono, nombre, accent }: { icono: string; nombre: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: accent, background: `${accent}1e` }}>
        <i className={`fa-solid ${icono}`} />
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>{nombre}</span>
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
